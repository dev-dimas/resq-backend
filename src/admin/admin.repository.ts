import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard(params: { id: string }): Promise<
    Prisma.AccountGetPayload<{
      select: {
        name: true;
        email: true;
        avatar: true;
        avatarBlurHash: true;
      };
    }> & {
      latitude: null;
      longitude: null;
      address: null;
      products: [];
      complaints: Prisma.ComplaintsGetPayload<{
        select: {
          customer: {
            select: {
              account: {
                select: {
                  name: true;
                  email: true;
                  avatar: true;
                  avatarBlurHash: true;
                  isActive: true;
                };
              };
            };
          };
          seller: {
            select: {
              account: {
                select: {
                  name: true;
                  email: true;
                  avatar: true;
                  avatarBlurHash: true;
                  isActive: true;
                };
              };
            };
          };
        };
      }>[];
    }
  > {
    const account = await this.prisma.account.findFirst({
      where: {
        id: params.id,
      },
      select: {
        name: true,
        email: true,
        avatar: true,
        avatarBlurHash: true,
      },
    });
    const complaints = await this.prisma.complaints.findMany({
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            account: {
              select: {
                name: true,
                email: true,
                avatar: true,
                avatarBlurHash: true,
                isActive: true,
              },
            },
          },
        },
        seller: {
          select: {
            account: {
              select: {
                name: true,
                email: true,
                avatar: true,
                avatarBlurHash: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      ...account,
      latitude: null,
      longitude: null,
      address: null,
      products: [],
      complaints,
    };
  }

  async getAccount(params: { id: string }): Promise<Account> {
    return await this.prisma.account.findFirst({
      where: {
        id: params.id,
        isAdmin: false,
      },
    });
  }

  async banAccount(params: { id: string }): Promise<void> {
    await this.prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async unbanAccount(params: { id: string }): Promise<void> {
    await this.prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: true,
      },
    });
  }

  async solveComplaint(complaintId: string): Promise<void> {
    await this.prisma.complaints.update({
      where: {
        id: complaintId,
      },
      data: {
        status: 'SOLVED',
      },
    });
  }

  async solveSameComplaint(sellerId: string): Promise<void> {
    await this.prisma.complaints.updateMany({
      where: {
        sellerId: sellerId,
        status: 'PENDING',
      },
      data: {
        status: 'SOLVED',
      },
    });
  }

  async getAccountByEmail(params: { email: string }): Promise<Account> {
    return await this.prisma.account.findFirst({
      where: {
        email: params.email,
        isAdmin: false,
      },
    });
  }
}
