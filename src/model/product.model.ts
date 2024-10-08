import { ApiProperty } from '@nestjs/swagger';
import { Customer, Prisma, Product } from '@prisma/client';

export class SearchProductResponse {
  customer: Customer;
  products: (Prisma.ProductGetPayload<{
    include: {
      seller: true;
    };
  }> & { distance: number })[];
}

export class FindProductByIdResponse {
  product: Prisma.ProductGetPayload<{
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
          address: true;
        };
      };
    };
  }> & { distance: number; seller: { subscriber: number } };
}

export class CreateProductRequest {
  name: string;
  description: string;
  price: string;
  categoryName: string;
  @ApiProperty({ type: 'string', format: 'binary' })
  images: any;
  startTime: string;
  endTime: string;
  isDaily: string;
}

export class CreateProductResponse {
  product: Product;
}

export class UpdateProductRequest {
  name?: string;
  description?: string;
  price?: string;
  categoryName?: string;
  @ApiProperty({ type: 'string', format: 'binary' })
  images?: any;
  startTime?: string;
  endTime?: string;
  isActive?: string;
  isDaily?: string;
}

export class UpdateProductResponse {
  product: Product;
}
