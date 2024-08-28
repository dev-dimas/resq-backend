import { Inject, Injectable } from '@nestjs/common';
import { Account, Prisma, Product, Seller } from '@prisma/client';
import dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { Logger } from 'winston';
import { manualData } from './manualData';
import { sellerInherited } from './sellerInherited';
import bcrypt from 'bcrypt';
import { ImageService } from 'src/common/image.service';
import path from 'path';

@Injectable()
export class SeedService {
  constructor(
    private prismaService: PrismaService,
    private imageService: ImageService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  private readonly isNeedUpdate: boolean = JSON.parse(
    process.env.IS_NEED_UPDATE_SEED_DATA || 'false',
  );

  async cleanSeed() {
    if (!this.isNeedUpdate) return;

    const query: Prisma.AccountWhereInput[] = [
      {
        password: {
          not: {
            startsWith: '$2b$',
          },
        },
      },
    ];

    for (let index = 1; index <= 20; index++) {
      query.push({ id: { equals: `${index}` } });
    }

    await this.prismaService.account.deleteMany({
      where: {
        OR: query,
      },
    });
  }

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
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        isSeller: false,
        isActive: true,
        isAdmin: true,
        admin: {
          create: {},
        },
      },
    });
  }

  async seedSellerAndProduct(): Promise<void> {
    const accountDb = await this.prismaService.account.findMany();
    const sellerDb = await this.prismaService.seller.findMany();
    const productDb = await this.prismaService.product.findMany();

    if (
      accountDb.length >= 20 ||
      sellerDb.length >= 20 ||
      productDb.length >= 20
    ) {
      this.logger.info('Seller and product already seeded');
      return;
    }

    const password = await bcrypt.hash(process.env.SELLER_DUMMY_PASSWORD, 10);

    const accounts: Omit<Account, 'createdAt' | 'updatedAt'>[] = [];
    const sellers: Omit<Seller, 'createdAt' | 'updatedAt'>[] = [];
    const products: Omit<Product, 'createdAt' | 'updatedAt'>[] = [];
    const startTimeSell = dayjs().minute(0).millisecond(0).toDate();
    const endTimeSell = dayjs()
      .subtract(1, 'hour')
      .minute(59)
      .millisecond(0)
      .toDate();

    for (let index = 1; index <= 20; index++) {
      accounts.push({
        id: `${index}`,
        name: manualData[index - 1].sellerName,
        avatar: `/assets/dummy/seller/seller-${index}.webp`,
        avatarBlurHash: await this.imageService.generateBlurhashFromLocal(
          path.join(
            __dirname,
            `../../../assets/dummy/seller/seller-${index}.webp`,
          ),
        ),
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
        imageBlurHash: await this.imageService.generateBlurhashFromLocal(
          path.join(
            __dirname,
            `../../../assets/dummy/product/product-${index}.webp`,
          ),
        ),
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
