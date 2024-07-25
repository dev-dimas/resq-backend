import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '@prisma/client';
import {
  GetSellerDataResponse,
  SellerDashboardResponse,
} from 'src/model/seller.model';
import { SellerRepository } from './seller.repository';

@Injectable()
export class SellerService {
  constructor(private sellerRepository: SellerRepository) {}

  async getSellerDashboard(account: Account): Promise<SellerDashboardResponse> {
    const seller = await this.sellerRepository.getSellerDashboard({
      id: account.id,
    });

    return {
      ...seller.account,
      latitude: seller.latitude,
      longitude: seller.longitude,
      subscriber: seller.subscriber.length,
      product: seller.product,
    };
  }

  async getSellerById(sellerId: string): Promise<GetSellerDataResponse> {
    const seller = await this.sellerRepository.getByIdWithProductAndSubscriber({
      id: sellerId,
    });

    if (!seller) throw new NotFoundException('Seller not found!');

    return { seller };
  }
}
