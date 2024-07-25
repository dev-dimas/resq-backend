import { Injectable } from '@nestjs/common';
import { Prisma, Seller } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SellerRepository {
  constructor(private prisma: PrismaService) {}

  async getSellerDashboard(params: { id: string }): Promise<
    Prisma.SellerGetPayload<{
      select: {
        account: {
          select: {
            name: true;
            email: true;
            avatar: true;
          };
        };
        latitude: true;
        longitude: true;
        subscriber: {
          select: {
            _count: true;
          };
        };
        product: {
          select: {
            id: true;
            name: true;
            description: true;
            categoryName: true;
            price: true;
            images: true;
            startTime: true;
            endTime: true;
            isDaily: true;
            isActive: true;
          };
        };
      };
    }>
  > {
    return await this.prisma.seller.findFirst({
      where: {
        accountId: params.id,
      },
      select: {
        account: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
        latitude: true,
        longitude: true,
        subscriber: {
          select: {
            _count: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            categoryName: true,
            price: true,
            images: true,
            startTime: true,
            endTime: true,
            isDaily: true,
            isActive: true,
          },
        },
      },
    });
  }

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
