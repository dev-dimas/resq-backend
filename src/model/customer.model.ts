export class SubscribeRequest {
  to: string;
}

export class UnsubscribeRequest {
  from: string;
}

export class AddFavoriteRequest {
  productId: string;
}

export class RemoveFavoriteRequest {
  productId: string;
}
