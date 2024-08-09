import { Injectable } from '@nestjs/common';
import { Complaints, Prisma } from '@prisma/client';
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
      complaints: Complaints[];
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
    const complaints = await this.prisma.complaints.findMany();
    return {
      ...account,
      latitude: null,
      longitude: null,
      address: null,
      products: [],
      complaints,
    };
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
}
