import { Inject, Injectable } from '@nestjs/common';
import { Account, Product, Seller } from '@prisma/client';
import dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { Logger } from 'winston';
import { manualData } from './manualData';
import { sellerInherited } from './sellerInherited';

@Injectable()
export class SeedService {
  constructor(
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async seedCategory(): Promise<void> {
    const category = await this.prismaService.category.findMany();

    if (category.length > 0) {
      this.logger.info('Category already seeded');
      return;
    }

    await this.prismaService.category.createMany({
      data: [
        { name: 'Makanan' },
        { name: 'Minuman' },
        { name: 'Salad' },
        { name: 'Dessert' },
      ],
    });
  }

  async seedAdmin(): Promise<void> {
    const admin = await this.prismaService.admin.findMany();

    if (admin.length > 0) {
      this.logger.info('Admin already seeded');
      return;
    }

    await this.prismaService.account.create({
      data: {
        name: 'Admin',
        email: 'resq@admin.com',
        password: process.env.ADMIN_PASSWORD,
        isSeller: false,
        isActive: true,
        isAdmin: true,

        admin: {
          create: {},
        },
      },
    });
  }

  async seedSellerAndProdyct(): Promise<void> {
    const accountDb = await this.prismaService.account.findMany();
    const sellerDb = await this.prismaService.seller.findMany();
    const productDb = await this.prismaService.product.findMany();

    if (
      accountDb.length >= 15 ||
      sellerDb.length >= 15 ||
      productDb.length >= 15
    ) {
      this.logger.info('Seller and product already seeded');
      return;
    }

    const password = 'sellerdummy';
    const blurHash = 'L3SigQ00~p-:?bV@IVWX%NxuIUoe';

    const accounts: Omit<Account, 'createdAt' | 'updatedAt'>[] = [];
    const sellers: Omit<Seller, 'createdAt' | 'updatedAt'>[] = [];
    const products: Omit<Product, 'createdAt' | 'updatedAt'>[] = [];
    const startTimeSell = dayjs().minute(0).millisecond(0).toDate();
    const endTimeSell = dayjs()
      .subtract(1, 'hour')
      .minute(59)
      .millisecond(0)
      .toDate();

    for (let index = 1; index <= 15; index++) {
      accounts.push({
        id: `${index}`,
        name: manualData[index - 1].sellerName,
        avatar: `/assets/dummy/seller/seller-${index}.webp`,
        avatarBlurHash: blurHash,
        email: sellerInherited[index - 1].email,
        password: password,
        expoPushToken: null,
        isSeller: true,
        token: null,
        isActive: true,
        isAdmin: false,
      });

      sellers.push({
        accountId: `${index}`,
        address: sellerInherited[index - 1].address,
        latitude: sellerInherited[index - 1].latitude,
        longitude: sellerInherited[index - 1].longitude,
      });

      products.push({
        id: `${index}`,
        sellerId: `${index}`,
        name: manualData[index - 1].productName,
        categoryName: manualData[index - 1].categoryName,
        description: manualData[index - 1].productDescription,
        images: [`/assets/dummy/product/product-${index}.webp`],
        imageBlurHash: blurHash,
        isDaily: true,
        isActive: true,
        price: `${manualData[index - 1].price}`,
        startTime: startTimeSell,
        endTime: endTimeSell,
      });
    }

    await this.prismaService.account.createMany({
      data: accounts,
      skipDuplicates: true,
    });

    await this.prismaService.seller.createMany({
      data: sellers,
      skipDuplicates: true,
    });

    await this.prismaService.product.createMany({
      data: products,
      skipDuplicates: true,
    });
  }
}
