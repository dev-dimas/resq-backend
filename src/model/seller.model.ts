import { Prisma } from '@prisma/client';

export class SellerDashboardResponse {
  name: string;
  email: string;
  avatar: string;
  latitude: string;
  longitude: string;
  subscriber: number;
  products: Prisma.ProductGetPayload<{
    select: {
      id: true;
      name: true;
      description: true;
      categoryName: true;
      price: true;
      images: true;
      startTime: true;
      endTime: true;
      isDaily: true;
      isActive: true;
    };
  }>[];
}

export class GetSellerDataResponse {
  seller: Prisma.SellerGetPayload<{
    include: {
      product: true;
      subscriber: true;
    };
  }>;
}
