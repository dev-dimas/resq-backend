import { Prisma } from '@prisma/client';

export class GetSellerDataResponse {
  seller: Prisma.SellerGetPayload<{
    include: {
      product: true;
      subscriber: true;
    };
  }>;
}
