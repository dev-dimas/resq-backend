export class SubscriptionListResponse {
  accountId: string;
  latitude: string | null;
  longitude: string | null;
  name: string;
  avatar: string | null;
  distance: number;
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
  price: string;
  distance: number;
}

export class AddFavoriteRequest {
  productId: string;
}

export class RemoveFavoriteRequest {
  productId: string;
}
