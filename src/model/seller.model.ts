import { Prisma } from '@prisma/client';

export class SellerDashboardResponse {
  name: string;
  email: string;
  avatar: string;
  latitude: string;
  longitude: string;
  subscriber: number;
  product: {
    name: string;
    id: string;
    price: string;
    images: string[];
  }[];
}

export class GetSellerDataResponse {
  seller: Prisma.SellerGetPayload<{
    include: {
      product: true;
      subscriber: true;
    };
  }>;
}
