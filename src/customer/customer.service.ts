import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
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
import { Logger } from 'winston';
import { CustomerRepository } from './customer.repository';
import { CustomerValidation } from './customer.validation';
import { HaversineService } from 'src/utils/haversine/haversine.service';
import dayjs from 'dayjs';

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

    const availableProducts = productsInRadius.filter((product) => {
      let isAvailable = false;

      const startDate = dayjs(product.startTime);
      const endDate = dayjs(product.endTime);

      const startTimeSell = dayjs(
        product.isDaily ? undefined : product.startTime,
      )
        .hour(startDate.hour())
        .minute(startDate.minute());
      const endTimeSell = dayjs(product.isDaily ? undefined : product.startTime)
        .hour(endDate.hour())
        .minute(endDate.minute());
      const now = dayjs();

      if (now.isAfter(startTimeSell) && now.isBefore(endTimeSell))
        isAvailable = true;

      return isAvailable;
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

    const customer = await this.customerRepository.getCustomer({
      id: account.id,
    });

    return subscriptionList.map((seller) => {
      return {
        accountId: seller.accountId,
        latitude: seller.latitude,
        longitude: seller.longitude,
        ...seller.account,
        distance: this.haversineService.calculateDistance(
          customer.latitude,
          customer.longitude,
          seller.latitude,
          seller.longitude,
        ),
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
}
