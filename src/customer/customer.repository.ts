import { Injectable } from '@nestjs/common';
import { Customer, Prisma, Seller } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  async getCustomer(params: { id: string }): Promise<Customer> {
    return await this.prisma.customer.findFirst({
      where: { accountId: params.id },
    });
  }

  async getCustomerWithSubcription(params: {
    id: string;
  }): Promise<Customer & { subscription: Seller[] }> {
    const subscriptionList = await this.prisma.customer.findFirst({
      where: {
        accountId: params.id,
      },
      include: {
        subscription: {
          select: {
            subscription: true,
          },
        },
      },
    });

    return {
      ...subscriptionList,
      subscription: subscriptionList.subscription.subscription,
    };
  }

  async addSubscription(params: {
    id: string;
    sellerId: string;
  }): Promise<void> {
    await this.prisma.customer.update({
      where: {
        accountId: params.id,
      },
      data: {
        subscription: {
          upsert: {
            create: {
              subscription: {
                connect: {
                  accountId: params.sellerId,
                },
              },
            },
            update: {
              subscription: {
                connect: {
                  accountId: params.sellerId,
                },
              },
            },
          },
        },
      },
    });
  }

  async removeSubscription(params: {
    id: string;
    sellerId: string;
  }): Promise<void> {
    await this.prisma.customer.update({
      where: {
        accountId: params.id,
      },
      data: {
        subscription: {
          update: {
            subscription: {
              disconnect: {
                accountId: params.sellerId,
              },
            },
          },
        },
      },
    });
  }

  async getCustomerWithFavorite(params: { id: string }): Promise<
    Prisma.CustomerGetPayload<{
      include: { favorite: { select: { product: true } } };
    }>
  > {
    return await this.prisma.customer.findFirst({
      where: {
        accountId: params.id,
      },
      include: {
        favorite: {
          select: {
            product: true,
          },
        },
      },
    });
  }

  async addFavorite(params: { id: string; productId: string }): Promise<void> {
    await this.prisma.customer.update({
      where: {
        accountId: params.id,
      },
      data: {
        favorite: {
          upsert: {
            create: {
              product: {
                connect: {
                  id: params.productId,
                },
              },
            },
            update: {
              product: {
                connect: {
                  id: params.productId,
                },
              },
            },
          },
        },
      },
    });
  }

  async removeFavorite(params: {
    id: string;
    productId: string;
  }): Promise<void> {
    await this.prisma.customer.update({
      where: {
        accountId: params.id,
      },
      data: {
        favorite: {
          update: {
            product: {
              disconnect: {
                id: params.productId,
              },
            },
          },
        },
      },
    });
  }
}
