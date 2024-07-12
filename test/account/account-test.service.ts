import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/prisma.service';
import { ACCOUNT_CUSTOMER_TEST, ACCOUNT_SELLER_TEST } from '../test.env';

@Injectable()
export class AccountTestService {
  constructor(private prismaService: PrismaService) {}

  async createCustomer() {
    await this.prismaService.account.create({
      data: {
        email: ACCOUNT_CUSTOMER_TEST.email,
        name: ACCOUNT_CUSTOMER_TEST.name,
        password: await bcrypt.hash(ACCOUNT_CUSTOMER_TEST.password, 10),
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

  async createSeller() {
    await this.prismaService.account.create({
      data: {
        email: ACCOUNT_SELLER_TEST.email,
        name: ACCOUNT_SELLER_TEST.name,
        password: await bcrypt.hash(ACCOUNT_SELLER_TEST.password, 10),
        isSeller: true,
        seller: {
          create: {},
        },
      },
    });
  }

  async deleteCustomer() {
    await this.prismaService.account.deleteMany({
      where: {
        email: ACCOUNT_CUSTOMER_TEST.email,
      },
    });
  }

  async deleteSeller() {
    await this.prismaService.account.deleteMany({
      where: {
        email: ACCOUNT_SELLER_TEST.email,
      },
    });
  }

  async getCustomer() {
    return await this.prismaService.account.findFirst({
      where: {
        email: ACCOUNT_CUSTOMER_TEST.email,
      },
    });
  }

  async getSeller() {
    return await this.prismaService.account.findFirst({
      where: {
        email: ACCOUNT_SELLER_TEST.email,
      },
    });
  }
}
