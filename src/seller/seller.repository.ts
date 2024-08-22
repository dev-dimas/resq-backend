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
            avatarBlurHash: true;
            expoPushToken: true;
            token: true;
          };
        };
        latitude: true;
        longitude: true;
        address: true;
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
            imageBlurHash: true;
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
        account: {
          isActive: true,
        },
      },
      select: {
        account: {
          select: {
            name: true,
            email: true,
            avatar: true,
            avatarBlurHash: true,
            expoPushToken: true,
            token: true,
          },
        },
        latitude: true,
        longitude: true,
        address: true,
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
            imageBlurHash: true,
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
        account: {
          isActive: true,
        },
      },
    });
  }

  async getByIdWithProductAndSubscriber(params: {
    id: string;
    customerId: string;
  }): Promise<
    Prisma.SellerGetPayload<{
      select: {
        accountId: true;
        account: {
          select: {
            name: true;
            avatar: true;
            avatarBlurHash: true;
          };
        };
        latitude: true;
        longitude: true;
        address: true;
        subscriber: {
          select: {
            _count: true;
          };
        };
        product: {
          select: {
            id: true;
            name: true;
            price: true;
            images: true;
            imageBlurHash: true;
            isActive: true;
            isDaily: true;
            startTime: true;
            endTime: true;
          };
        };
        complaints: true;
      };
    }>
  > {
    return await this.prisma.seller.findFirst({
      where: {
        accountId: params.id,
        account: {
          isActive: true,
        },
      },
      select: {
        accountId: true,
        account: {
          select: {
            name: true,
            avatar: true,
            avatarBlurHash: true,
          },
        },
        latitude: true,
        longitude: true,
        address: true,
        subscriber: {
          select: {
            _count: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            imageBlurHash: true,
            isActive: true,
            isDaily: true,
            startTime: true,
            endTime: true,
          },
        },
        complaints: {
          where: {
            sellerId: params.id,
            customerId: params.customerId,
            status: 'PENDING',
          },
        },
      },
    });
  }

  async getSubscribers(params: { id: string }): Promise<
    Prisma.SellerGetPayload<{
      select: {
        subscriber: {
          select: {
            customerId: true;
            customer: {
              select: {
                account: {
                  select: {
                    expoPushToken: true;
                  };
                };
              };
            };
          };
        };
      };
    }>[]
  > {
    return await this.prisma.seller.findMany({
      where: {
        accountId: params.id,
      },
      select: {
        subscriber: {
          select: {
            customerId: true,
            customer: {
              select: {
                account: {
                  select: {
                    expoPushToken: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
