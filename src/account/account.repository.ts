import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { RegisterAccountRequest } from 'src/model/account.model';

@Injectable()
export class AccountRepository {
  constructor(private prisma: PrismaService) {}

  async isAccountExist(params: { email: string }): Promise<number> {
    return await this.prisma.account.count({
      where: {
        email: params.email,
      },
    });
  }

  async createAccountCustomer(
    registerData: RegisterAccountRequest,
  ): Promise<void> {
    await this.prisma.account.create({
      data: {
        email: registerData.email,
        name: registerData.name,
        password: registerData.password,
        isSeller: false,
        customer: {
          create: {
            favorite: {
              create: {},
            },
            subscription: {
              create: {},
            },
          },
        },
      },
    });
  }

  async createAccountSeller(
    registerData: RegisterAccountRequest,
  ): Promise<void> {
    await this.prisma.account.create({
      data: {
        email: registerData.email,
        name: registerData.name,
        password: registerData.password,
        isSeller: true,
        seller: {
          create: {},
        },
      },
    });
  }

  async findByEmail(params: { email: string }): Promise<Account> {
    return await this.prisma.account.findFirst({
      where: {
        email: params.email,
      },
    });
  }

  async updateAccount(params: {
    id: string;
    email: string;
    name: string;
  }): Promise<Account> {
    return await this.prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        email: params.email,
        name: params.name,
      },
    });
  }

  async updateNotificationToken(params: {
    id: string;
    token: string | null;
  }): Promise<void> {
    await this.prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        expoPushToken: params.token || null,
      },
    });
  }

  async updateAccountAvatar(params: {
    id: string;
    path: string | null;
  }): Promise<void> {
    await this.prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        avatar: params.path || null,
      },
    });
  }

  async updateAccountPassword(params: {
    id: string;
    password: string;
  }): Promise<void> {
    await this.prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        password: params.password,
      },
    });
  }

  async updateAccountLocation(params: {
    account: Account;
    latitude: string;
    longitude: string;
  }) {
    if (params.account.isSeller) {
      return await this.prisma.seller.update({
        where: {
          accountId: params.account.id,
        },
        data: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        select: {
          latitude: true,
          longitude: true,
        },
      });
    }

    return await this.prisma.customer.update({
      where: {
        accountId: params.account.id,
      },
      data: {
        latitude: `${params.latitude}`,
        longitude: `${params.longitude}`,
      },
      select: {
        latitude: true,
        longitude: true,
      },
    });
  }

  async setToken(params: { email: string; token: string }): Promise<void> {
    await this.prisma.account.update({
      where: {
        email: params.email,
      },
      data: {
        token: params.token,
      },
    });
  }

  async deleteToken(params: { id: string }): Promise<void> {
    await this.prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        token: null,
      },
    });
  }
}
