import { Injectable } from '@nestjs/common';
import { Complaints, Customer, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  async getCustomerDashboard(params: { id: string }): Promise<
    Prisma.CustomerGetPayload<{
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
      };
    }>
  > {
    return await this.prisma.customer.findFirst({
      where: { accountId: params.id, account: { isActive: true } },
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
      },
    });
  }

  async getCustomer(params: { id: string }): Promise<Customer> {
    return await this.prisma.customer.findFirst({
      where: { accountId: params.id, account: { isActive: true } },
    });
  }

  async getCustomerWithSubcription(params: { id: string }): Promise<
    Prisma.SellerGetPayload<{
      select: {
        account: {
          select: {
            name: true;
            avatar: true;
            avatarBlurHash: true;
          };
        };
        accountId: true;
        latitude: true;
        longitude: true;
        address: true;
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
        account: {
          isActive: true,
        },
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
            avatarBlurHash: true,
          },
        },
        accountId: true,
        latitude: true,
        longitude: true,
        address: true,
        subscriber: {
          select: {
            _count: true,
          },
        },
      },
    });
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
              where: {
                seller: {
                  account: {
                    isActive: true;
                  };
                };
              };
              select: {
                id: true;
                name: true;
                price: true;
                images: true;
                imageBlurHash: true;
                startTime: true;
                endTime: true;
                isDaily: true;
                isActive: true;
                seller: {
                  select: {
                    latitude: true;
                    longitude: true;
                    account: {
                      select: {
                        isActive: true;
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    }>
  > {
    const favoriteList = await this.prisma.customer.findFirst({
      where: {
        accountId: params.id,
      },
      select: {
        favorite: {
          select: {
            product: {
              where: {
                seller: {
                  account: {
                    isActive: true,
                  },
                },
              },
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                imageBlurHash: true,
                startTime: true,
                endTime: true,
                isDaily: true,
                isActive: true,
                seller: {
                  select: {
                    latitude: true,
                    longitude: true,
                    account: {
                      select: {
                        isActive: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!favoriteList) return { favorite: { product: [] } };

    return favoriteList;
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

  async removeAllFavorite(params: { id: string }): Promise<void> {
    await this.prisma.customer.update({
      where: {
        accountId: params.id,
      },
      data: {
        favorite: {
          update: {
            product: {
              set: [],
            },
          },
        },
      },
    });
  }

  async createComplaint(params: {
    id: string;
    sellerId: string;
    description: string;
  }): Promise<void> {
    await this.prisma.complaints.create({
      data: {
        customerId: params.id,
        sellerId: params.sellerId,
        description: params.description,
      },
    });
  }

  async getPreviousComplaint(params: {
    id: string;
    sellerId: string;
  }): Promise<Complaints | null> {
    return await this.prisma.complaints.findFirst({
      where: {
        customerId: params.id,
        sellerId: params.sellerId,
        status: 'PENDING',
      },
    });
  }
}
