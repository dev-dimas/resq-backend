import { Injectable } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  async getCustomer(params: { id: string }): Promise<Customer> {
    return await this.prisma.customer.findFirst({
      where: { accountId: params.id },
    });
  }

  async getCustomerWithSubcription(params: { id: string }): Promise<
    Prisma.SellerGetPayload<{
      select: {
        account: {
          select: {
            name: true;
            avatar: true;
          };
        };
        accountId: true;
        latitude: true;
        longitude: true;
        subscriber: {
          select: {
            _count: true;
          };
        };
      };
    }>[]
  > {
    const subscriptionList = await this.prisma.seller.findMany({
      where: {
        subscriber: {
          some: {
            customerId: params.id,
          },
        },
      },
      select: {
        account: {
          select: {
            name: true,
            avatar: true,
          },
        },
        accountId: true,
        latitude: true,
        longitude: true,
        subscriber: {
          select: {
            _count: true,
          },
        },
      },
    });

    // const subscription = subscriptionList.subscription.subscription?.map(
    //   (account) => {
    //     return {
    //       sellerId: account.account.id,
    //       name: account.account.name,
    //       avatar: account.account.avatar,
    //       latitude: account.account.seller.latitude,
    //       longitude: account.account.seller.longitude,
    //       subscriber: account.account.seller.subscriber[0]._count.subscription,
    //       distance: this.haversine.calculateDistance(
    //         subscriptionList.latitude,
    //         subscriptionList.longitude,
    //         account.account.seller.latitude,
    //         account.account.seller.longitude,
    //       ),
    //     };
    //   },
    // );

    return subscriptionList;
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
      select: {
        favorite: {
          select: {
            product: {
              select: {
                id: true;
                name: true;
                price: true;
                images: true;
                seller: {
                  select: {
                    latitude: true;
                    longitude: true;
                  };
                };
              };
            };
          };
        };
      };
    }>
  > {
    return await this.prisma.customer.findFirst({
      where: {
        accountId: params.id,
      },
      select: {
        favorite: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                seller: {
                  select: {
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
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
