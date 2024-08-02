import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '@prisma/client';
import {
  GetSellerDataResponse,
  SellerDashboardResponse,
} from 'src/model/seller.model';
import { SellerRepository } from './seller.repository';
import dayjs from 'dayjs';

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
      address: seller.address,
      subscriber: seller.subscriber.length,
      products: seller.product,
    };
  }

  async getSellerById(sellerId: string): Promise<GetSellerDataResponse> {
    const seller = await this.sellerRepository.getByIdWithProductAndSubscriber({
      id: sellerId,
    });

    if (!seller) throw new NotFoundException('Seller not found!');

    const now = dayjs();

    return {
      accountId: seller.accountId,
      name: seller.account.name,
      avatar: seller.account.avatar,
      avatarBlurHash: seller.account.avatarBlurHash,
      latitude: seller.latitude,
      longitude: seller.longitude,
      address: seller.address,
      subscriber: seller.subscriber.length,
      products: seller.product
        .filter((product) => {
          if (!product.isActive) return false;
          if (product.isDaily) return true;
          let isAvailable = false;

          const startDate = dayjs(product.startTime);
          const endDate = dayjs(product.endTime);

          if (now.isAfter(startDate) && now.isBefore(endDate))
            isAvailable = true;

          return isAvailable;
        })
        .map((product) => {
          let isOnSale = false;

          const startDate = dayjs(product.startTime);
          const endDate = dayjs(product.endTime);

          if (now.isAfter(startDate) && now.isBefore(endDate)) {
            isOnSale = true;
          } else if (!product.isDaily) {
            isOnSale = false;
          } else {
            let startTimeSell = dayjs(now)
              .hour(startDate.hour())
              .minute(startDate.minute());
            let endTimeSell = dayjs(now)
              .hour(endDate.hour())
              .minute(endDate.minute());

            if (startTimeSell.isAfter(endTimeSell)) {
              startTimeSell = startTimeSell.subtract(1, 'day');
            }

            if (now.isAfter(startTimeSell) && now.isBefore(endTimeSell)) {
              isOnSale = true;
            }
          }

          return {
            ...product,
            isOnSale,
          };
        }),
    };
  }
}
