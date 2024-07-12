import { Injectable } from '@nestjs/common';
import { Prisma, Seller } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SellerRepository {
  constructor(private prisma: PrismaService) {}

  async getById(params: { id: string }): Promise<Seller> {
    return await this.prisma.seller.findFirst({
      where: {
        accountId: params.id,
      },
    });
  }

  async getByIdWithProductAndSubscriber(params: {
    id: string;
  }): Promise<
    Prisma.SellerGetPayload<{ include: { product: true; subscriber: true } }>
  > {
    return await this.prisma.seller.findFirst({
      where: {
        accountId: params.id,
      },
      include: {
        product: true,
        subscriber: true,
      },
    });
  }
}
