import { Complaints, Prisma } from '@prisma/client';

export class SellerDashboardResponse {
  name: string;
  email: string;
  avatar: string;
  avatarBlurHash: string;
  latitude: string;
  longitude: string;
  address: string;
  subscriber: number;
  products: Prisma.ProductGetPayload<{
    select: {
      id: true;
      name: true;
      description: true;
      categoryName: true;
      price: true;
      images: true;
      imageBlurHash: true;
      startTime: true;
      endTime: true;
      isDaily: true;
      isActive: true;
    };
  }>[];
}

export class GetSellerDataResponse {
  accountId: string;
  name: string;
  avatar: string;
  avatarBlurHash: string;
  latitude: string;
  longitude: string;
  address: string;
  subscriber: number;
  complaint: Complaints | null;
  products: (Prisma.ProductGetPayload<{
    select: {
      id: true;
      name: true;
      price: true;
      images: true;
      imageBlurHash: true;
      startTime: true;
      endTime: true;
      isDaily: true;
      isActive: true;
    };
  }> & {
    isOnSale: boolean;
  })[];
}
