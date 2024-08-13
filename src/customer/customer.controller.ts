import { Body, Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Account } from '@prisma/client';
import { AuthCustomer } from 'src/common/auth.decorator';
import {
  AddFavoriteRequest,
  CreateComplaintRequest,
  FavoriteListResponse,
  RemoveFavoriteRequest,
  SubscribeRequest,
  SubscriptionListResponse,
  UnsubscribeRequest,
} from 'src/model/customer.model';
import { WebResponse } from 'src/model/web.model';
import { CustomerService } from './customer.service';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  // @Get()
  // @ApiBearerAuth()
  // async getCustomerDashboard(
  //   @AuthCustomer() account: Account,
  // ): Promise<WebResponse<any>> {
  //   return {
  //     message: 'Successfully get customer dashboard',
  //     data: await this.customerService.getCustomerDashboard(account),
  //   };
  // }

  @Get('subscription')
  @ApiBearerAuth()
  async getAllSubscription(
    @AuthCustomer() account: Account,
  ): Promise<WebResponse<SubscriptionListResponse[]>> {
    return {
      message: 'Successfully get subscription list',
      data: await this.customerService.subscriptionList(account),
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
  async getAllFavorite(
    @AuthCustomer() account: Account,
  ): Promise<WebResponse<FavoriteListResponse[]>> {
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

  @Delete('favorite/all')
  @ApiBearerAuth()
  async removeAllFavorite(
    @AuthCustomer() account: Account,
  ): Promise<WebResponse> {
    await this.customerService.removeAllFavorite(account);
    return { message: 'Successfully removed all from favorite' };
  }

  @Post('complaint')
  @ApiBearerAuth()
  async createComplaint(
    @AuthCustomer() account: Account,
    @Body() request: CreateComplaintRequest,
  ): Promise<WebResponse> {
    await this.customerService.createComplaint(account, request);
    return { message: 'Successfully created complaint' };
  }
}
