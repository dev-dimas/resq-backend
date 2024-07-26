import { Injectable } from '@nestjs/common';
import { Account, Prisma, PrismaClient, Product } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/common/prisma.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
} from 'src/model/product.model';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async findByKeyword(params: {
    keyword: string;
  }): Promise<Prisma.ProductGetPayload<{ include: { seller: true } }>[]> {
    return await this.prisma.product.findMany({
      where: {
        name: {
          contains: params.keyword,
        },
        isActive: true,
      },
      include: {
        seller: true,
      },
    });
  }

  async getAll(): Promise<
    Prisma.ProductGetPayload<{ include: { seller: true } }>[]
  > {
    return await this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        seller: true,
      },
    });
  }

  async getAllProductWithinRadius(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<(Product & { latitude: string; longitude: string })[]> {
    const products = await this.prisma.$queryRaw`
    SELECT
      p."id",
      p."seller_id" AS "sellerId",
      p."category_name" AS "categoryName",
      p."name",
      p."description",
      p."price",
      p."images",
      s."latitude",
      s."longitude",
      p."start_time" AS "startTime",
      p."end_time" AS "endTime",
      p."is_daily" AS "isDaily",
      p."is_active" AS "isActive"
    FROM
      "Product" p
    JOIN
      "Seller" s ON p."seller_id" = s."account_id"
    WHERE
      6371 * acos(
        cos(radians(${latitude})) * cos(radians(CAST(s."latitude" AS float))) *
        cos(radians(CAST(s."longitude" AS float)) - radians(${longitude})) +
        sin(radians(${latitude})) * sin(radians(CAST(s."latitude" AS float)))
      ) <= ${radius}
      AND p."is_active" = true
  `;

    return products as (Product & { latitude: string; longitude: string })[];
  }

  async getById(params: { id: string }): Promise<Product> {
    return await this.prisma.product.findFirst({
      where: {
        id: params.id,
      },
    });
  }

  async getByIdWithSeller(params: { id: string }): Promise<
    Prisma.ProductGetPayload<{
      include: {
        seller: {
          select: {
            account: {
              select: {
                id: true;
                name: true;
                avatar: true;
              };
            };
            latitude: true;
            longitude: true;
            subscriber: {
              select: {
                _count: true;
              };
            };
          };
        };
      };
    }>
  > {
    return await this.prisma.product.findFirst({
      where: {
        id: params.id,
      },
      include: {
        seller: {
          select: {
            account: {
              select: {
                name: true,
                avatar: true,
              },
            },
            latitude: true,
            longitude: true,
            subscriber: {
              select: {
                _count: true,
              },
            },
          },
        },
      },
    });
  }

  async createProduct(params: {
    prisma: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
    productData: CreateProductRequest;
    imagePath: string;
    account: Account;
  }): Promise<Product> {
    return await params.prisma.product.create({
      data: {
        name: params.productData.name,
        description: params.productData.description,
        price: params.productData.price,
        images: [params.imagePath],
        categoryName: params.productData.categoryName,
        startTime: params.productData.startTime,
        endTime: params.productData.endTime,
        isActive: true,
        isDaily: JSON.parse(params.productData.isDaily),
        sellerId: params.account.id,
      },
    });
  }

  async updateProduct(params: {
    prisma: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
    productData: UpdateProductRequest;
    productId: string;
    imagePath: string;
    account: Account;
  }): Promise<Product> {
    return await params.prisma.product.update({
      where: {
        id: params.productId,
        sellerId: params.account.id,
      },
      data: {
        name: params.productData.name || undefined,
        description: params.productData.description || undefined,
        price: params.productData.price || undefined,
        images: params.imagePath ? [params.imagePath] : undefined,
        categoryName: params.productData.categoryName || undefined,
        startTime: params.productData.startTime || undefined,
        endTime: params.productData.endTime || undefined,
        isActive: params.productData.isActive
          ? JSON.parse(params.productData.isActive)
          : undefined,
        isDaily: params.productData.isDaily
          ? JSON.parse(params.productData.isDaily)
          : undefined,
        sellerId: params.account.id || undefined,
      },
    });
  }

  async deleteProduct(params: { id: string; sellerId: string }): Promise<void> {
    await this.prisma.product.delete({
      where: {
        id: params.id,
        sellerId: params.sellerId,
      },
    });
  }

  async changeTimeSell(params: {
    id: string;
    sellerId: string;
    startTime: Date;
    endTime: Date;
  }) {
    await this.prisma.product.update({
      where: {
        id: params.id,
        sellerId: params.sellerId,
      },
      data: {
        isActive: true,
        startTime: params.startTime,
        endTime: params.endTime,
      },
    });
  }
}
