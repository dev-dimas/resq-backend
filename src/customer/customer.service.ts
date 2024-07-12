import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account, Customer, Prisma, Seller } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from 'src/common/validation.service';
import {
  AddFavoriteRequest,
  RemoveFavoriteRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from 'src/model/customer.model';
import { ProductRepository } from 'src/product/product.repository';
import { SellerRepository } from 'src/seller/seller.repository';
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
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async subscriptionList(
    account: Account,
  ): Promise<Customer & { subscription: Seller[] }> {
    return await this.customerRepository.getCustomerWithSubcription({
      id: account.id,
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

    const customer = await this.customerRepository.getCustomerWithSubcription({
      id: account.id,
    });

    if (
      customer.subscription &&
      customer.subscription.find(
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

    const customer = await this.customerRepository.getCustomerWithSubcription({
      id: account.id,
    });

    if (
      customer.subscription &&
      !customer.subscription.find(
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

  async favoriteList(account: Account): Promise<
    Prisma.CustomerGetPayload<{
      include: { favorite: { select: { product: true } } };
    }>
  > {
    return await this.customerRepository.getCustomerWithFavorite({
      id: account.id,
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
