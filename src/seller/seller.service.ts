import { Injectable, NotFoundException } from '@nestjs/common';
import { GetSellerDataResponse } from 'src/model/seller.model';
import { SellerRepository } from './seller.repository';

@Injectable()
export class SellerService {
  constructor(private sellerRepository: SellerRepository) {}

  async getSellerById(sellerId: string): Promise<GetSellerDataResponse> {
    const seller = await this.sellerRepository.getByIdWithProductAndSubscriber({
      id: sellerId,
    });

    if (!seller) throw new NotFoundException('Seller not found!');

    return { seller };
  }
}
