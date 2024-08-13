import { Product } from '@prisma/client';

export class CustomerDashboardResponse {
  name: string;
  email: string;
  avatar: string;
  avatarBlurHash: string;
  latitude: string;
  longitude: string;
  address: string;
  products: (Product & {
    latitude: string;
    longitude: string;
    distance: number;
  })[];
}

export class SubscriptionListResponse {
  accountId: string;
  latitude: string | null;
  longitude: string | null;
  address: string;
  name: string;
  avatar: string | null;
  avatarBlurHash: string | null;
  subscriber: number;
}

export class SubscribeRequest {
  to: string;
}

export class UnsubscribeRequest {
  from: string;
}

export class FavoriteListResponse {
  id: string;
  name: string;
  images: string[];
  imageBlurHash: string;
  price: string;
  distance: number;
}

export class AddFavoriteRequest {
  productId: string;
}

export class RemoveFavoriteRequest {
  productId: string;
}

export class CreateComplaintRequest {
  sellerId: string;
  description: string;
}
