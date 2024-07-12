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

  async getById(params: { id: string }): Promise<Product> {
    return await this.prisma.product.findFirst({
      where: {
        id: params.id,
      },
    });
  }

  async getByIdWithSeller(params: {
    id: string;
  }): Promise<Prisma.ProductGetPayload<{ include: { seller: true } }>> {
    return await this.prisma.product.findFirst({
      where: {
        id: params.id,
      },
      include: {
        seller: true,
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
}
