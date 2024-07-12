import { Body, Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Account, Customer, Prisma, Seller } from '@prisma/client';
import { AuthCustomer } from 'src/common/auth.decorator';
import {
  AddFavoriteRequest,
  RemoveFavoriteRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from 'src/model/customer.model';
import { WebResponse } from 'src/model/web.model';
import { CustomerService } from './customer.service';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get('subscription')
  @ApiBearerAuth()
  async getAllSubscription(
    @AuthCustomer() account: Account,
  ): Promise<WebResponse<Customer & { subscription: Seller[] }>> {
    const subscriptionList =
      await this.customerService.subscriptionList(account);

    return {
      message: 'Successfully get subscription list',
      data: subscriptionList,
    };
  }

  @Post('subscription')
  @ApiBearerAuth()
  @HttpCode(200)
  async subscribeToSeller(
    @AuthCustomer() account: Account,
    @Body() request: SubscribeRequest,
  ): Promise<WebResponse> {
    await this.customerService.subscribeToSeller(account, request);

    return {
      message: `Successfully subscribed to seller ${request.to}`,
    };
  }

  @Delete('subscription')
  @ApiBearerAuth()
  @HttpCode(200)
  async unsubscribeFromSeller(
    @AuthCustomer() account: Account,
    @Body() request: UnsubscribeRequest,
  ): Promise<WebResponse> {
    await this.customerService.unsubscribeFromSeller(account, request);

    return {
      message: `Successfully unsubscribed from seller ${request.from}`,
    };
  }

  @Get('favorite')
  @ApiBearerAuth()
  async getAllFavorite(@AuthCustomer() account: Account): Promise<
    WebResponse<
      Prisma.CustomerGetPayload<{
        include: { favorite: { select: { product: true } } };
      }>
    >
  > {
    return {
      message: 'Successfully get favorite list',
      data: await this.customerService.favoriteList(account),
    };
  }

  @Post('favorite')
  @ApiBearerAuth()
  @HttpCode(200)
  async addFavorite(
    @AuthCustomer() account: Account,
    @Body() request: AddFavoriteRequest,
  ): Promise<WebResponse> {
    await this.customerService.addFavorite(account, request);
    return { message: 'Successfully added to favorite' };
  }

  @Delete('favorite')
  @ApiBearerAuth()
  async removeFavorite(
    @AuthCustomer() account: Account,
    @Body() request: RemoveFavoriteRequest,
  ): Promise<WebResponse> {
    await this.customerService.removeFavorite(account, request);
    return { message: 'Successfully removed from favorite' };
  }
}
