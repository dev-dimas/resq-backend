import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from 'src/common/validation.service';
import {
  AddFavoriteRequest,
  CustomerDashboardResponse,
  FavoriteListResponse,
  RemoveFavoriteRequest,
  SubscribeRequest,
  SubscriptionListResponse,
  UnsubscribeRequest,
} from 'src/model/customer.model';
import { ProductRepository } from 'src/product/product.repository';
import { SellerRepository } from 'src/seller/seller.repository';
import { HaversineService } from 'src/utils/haversine/haversine.service';
import { Logger } from 'winston';
import { CustomerRepository } from './customer.repository';
import { CustomerValidation } from './customer.validation';

@Injectable()
export class CustomerService {
  constructor(
    private validationService: ValidationService,
    private customerRepository: CustomerRepository,
    private sellerRepository: SellerRepository,
    private productRepository: ProductRepository,
    private haversineService: HaversineService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async getCustomerDashboard(
    account: Account,
  ): Promise<CustomerDashboardResponse> {
    const customer =
      await this.customerRepository.getCustomerDashboard(account);

    const latitude = parseFloat(customer.latitude);
    const longitude = parseFloat(customer.longitude);

    const productsInRadius =
      await this.productRepository.getAllProductWithinRadius(
        latitude,
        longitude,
        25,
      );

    const now = dayjs();

    const availableProducts = productsInRadius
      .filter((product) => {
        let isAvailable = false;

        const startDate = dayjs(product.startTime);
        const endDate = dayjs(product.endTime);

        if (now.isAfter(startDate) && now.isBefore(endDate)) {
          return (isAvailable = true);
        }

        if (!product.isDaily) {
          return (isAvailable = false);
        }

        const startTimeSell = dayjs(product.isDaily ? now : product.startTime)
          .hour(startDate.hour())
          .minute(startDate.minute());
        let endTimeSell = dayjs(product.isDaily ? now : product.endTime)
          .hour(endDate.hour())
          .minute(endDate.minute());

        if (product.isDaily && startTimeSell.isAfter(endTimeSell)) {
          endTimeSell = endTimeSell.add(1, 'day');
        }

        if (now.isAfter(startTimeSell) && now.isBefore(endTimeSell))
          isAvailable = true;

        console.log('isDaily');
        console.log('now', now.format());
        console.log('startDate', startDate.format());
        console.log('endDate', endDate.format());
        console.log('startTimeSell', startTimeSell.format());
        console.log('endTimeSell', endTimeSell.format());
        console.log('isAvailable', isAvailable);

        return isAvailable;
      })
      .map((product) => {
        const distance = this.haversineService.calculateDistance(
          latitude,
          longitude,
          product.latitude,
          product.longitude,
        );

        return {
          ...product,
          distance,
        };
      });

    return {
      ...customer.account,
      latitude: customer.latitude,
      longitude: customer.longitude,
      products: availableProducts,
    };
  }

  async subscriptionList(
    account: Account,
  ): Promise<SubscriptionListResponse[]> {
    const subscriptionList =
      await this.customerRepository.getCustomerWithSubcription({
        id: account.id,
      });

    return subscriptionList.map((seller) => {
      return {
        accountId: seller.accountId,
        latitude: seller.latitude,
        longitude: seller.longitude,
        ...seller.account,
        subscriber: seller.subscriber.length,
      };
    });
  }

  async subscribeToSeller(
    account: Account,
    request: SubscribeRequest,
  ): Promise<void> {
    const subscribeRequest: SubscribeRequest = this.validationService.validate(
      CustomerValidation.SUBSCRIBE,
      request,
    );

    const subscriptionList =
      await this.customerRepository.getCustomerWithSubcription({
        id: account.id,
      });

    if (
      subscriptionList &&
      subscriptionList.find(
        (seller) => seller.accountId === subscribeRequest.to,
      )
    ) {
      throw new ConflictException('You already subscribed to this seller!');
    }

    const seller = await this.sellerRepository.getById({
      id: subscribeRequest.to,
    });

    if (!seller) throw new NotFoundException('Seller not found!');

    await this.customerRepository.addSubscription({
      id: account.id,
      sellerId: subscribeRequest.to,
    });
  }

  async unsubscribeFromSeller(
    account: Account,
    request: UnsubscribeRequest,
  ): Promise<void> {
    const unsubscribedRequest: UnsubscribeRequest =
      this.validationService.validate(CustomerValidation.UNSUBSCRIBE, request);

    const subscriptionList =
      await this.customerRepository.getCustomerWithSubcription({
        id: account.id,
      });

    if (
      subscriptionList &&
      !subscriptionList.find(
        (seller) => seller.accountId === unsubscribedRequest.from,
      )
    ) {
      throw new ConflictException("You're not subscribing this seller!");
    }

    const seller = await this.sellerRepository.getById({
      id: unsubscribedRequest.from,
    });

    if (!seller) throw new NotFoundException('Seller not found!');

    await this.customerRepository.removeSubscription({
      id: account.id,
      sellerId: unsubscribedRequest.from,
    });
  }

  async favoriteList(account: Account): Promise<FavoriteListResponse[]> {
    const customer = await this.customerRepository.getCustomer({
      id: account.id,
    });

    const favoriteList = await this.customerRepository.getCustomerWithFavorite({
      id: account.id,
    });

    if (!favoriteList.favorite) return [];

    return favoriteList.favorite.product.map((product) => {
      return {
        id: product.id,
        name: product.name,
        images: product.images,
        price: product.price,
        distance: this.haversineService.calculateDistance(
          customer.latitude,
          customer.longitude,
          product.seller.latitude,
          product.seller.longitude,
        ),
      };
    });
  }

  async addFavorite(
    account: Account,
    request: AddFavoriteRequest,
  ): Promise<void> {
    const addFavoriteRequest: AddFavoriteRequest =
      this.validationService.validate(CustomerValidation.FAVORITE, request);

    const product = await this.productRepository.getById({
      id: addFavoriteRequest.productId,
    });

    if (!product) throw new NotFoundException('Product not found!');

    const customer = await this.customerRepository.getCustomerWithFavorite({
      id: account.id,
    });

    if (
      customer.favorite &&
      customer.favorite.product?.find(
        (product) => product.id === addFavoriteRequest.productId,
      )
    ) {
      throw new ConflictException(
        'This product is already in your favorite list',
      );
    }

    await this.customerRepository.addFavorite({
      id: account.id,
      productId: addFavoriteRequest.productId,
    });
  }

  async removeFavorite(
    account: Account,
    request: RemoveFavoriteRequest,
  ): Promise<void> {
    const removeFavoriteRequest: RemoveFavoriteRequest =
      this.validationService.validate(CustomerValidation.UNFAVORITE, request);

    const product = await this.productRepository.getById({
      id: removeFavoriteRequest.productId,
    });

    if (!product) throw new NotFoundException('Product not found!');

    const customer = await this.customerRepository.getCustomerWithFavorite({
      id: account.id,
    });

    if (
      customer.favorite &&
      !customer.favorite.product?.find(
        (product) => product.id === removeFavoriteRequest.productId,
      )
    ) {
      throw new ConflictException('This product is not in your favorite list!');
    }

    await this.customerRepository.removeFavorite({
      id: account.id,
      productId: removeFavoriteRequest.productId,
    });
  }

  async removeAllFavorite(account: Account): Promise<void> {
    await this.customerRepository.removeAllFavorite({ id: account.id });
  }
}
