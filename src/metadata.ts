/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./model/customer.model"), { "CustomerDashboardResponse": { name: { required: true, type: () => String }, email: { required: true, type: () => String }, avatar: { required: true, type: () => String }, avatarBlurHash: { required: true, type: () => String }, latitude: { required: true, type: () => String }, longitude: { required: true, type: () => String }, address: { required: true, type: () => String }, products: { required: true, type: () => [Object] } }, "SubscriptionListResponse": { accountId: { required: true, type: () => String }, latitude: { required: true, type: () => String, nullable: true }, longitude: { required: true, type: () => String, nullable: true }, address: { required: true, type: () => String }, name: { required: true, type: () => String }, avatar: { required: true, type: () => String, nullable: true }, avatarBlurHash: { required: true, type: () => String, nullable: true }, subscriber: { required: true, type: () => Number } }, "SubscribeRequest": { to: { required: true, type: () => String } }, "UnsubscribeRequest": { from: { required: true, type: () => String } }, "FavoriteListResponse": { id: { required: true, type: () => String }, name: { required: true, type: () => String }, images: { required: true, type: () => [String] }, imageBlurHash: { required: true, type: () => String }, price: { required: true, type: () => String }, distance: { required: true, type: () => Number } }, "AddFavoriteRequest": { productId: { required: true, type: () => String } }, "RemoveFavoriteRequest": { productId: { required: true, type: () => String } } }], [import("./model/web.model"), { "WebResponse": { data: { required: false }, errors: { required: false, type: () => String }, message: { required: false, type: () => String } } }], [import("./model/product.model"), { "SearchProductResponse": { customer: { required: true }, products: { required: true, type: () => [Object] } }, "FindProductByIdResponse": { product: { required: true, type: () => Object } }, "CreateProductRequest": { name: { required: true, type: () => String }, description: { required: true, type: () => String }, price: { required: true, type: () => String }, categoryName: { required: true, type: () => String }, images: { required: true, type: () => Object }, startTime: { required: true, type: () => String }, endTime: { required: true, type: () => String }, isDaily: { required: true, type: () => String } }, "CreateProductResponse": { product: { required: true } }, "UpdateProductRequest": { name: { required: false, type: () => String }, description: { required: false, type: () => String }, price: { required: false, type: () => String }, categoryName: { required: false, type: () => String }, images: { required: false, type: () => Object }, startTime: { required: false, type: () => String }, endTime: { required: false, type: () => String }, isActive: { required: false, type: () => String }, isDaily: { required: false, type: () => String } }, "UpdateProductResponse": { product: { required: true } } }], [import("./model/account.model"), { "RegisterAccountRequest": { email: { required: true, type: () => String }, name: { required: true, type: () => String }, password: { required: true, type: () => String }, asCustomer: { required: true, type: () => Boolean } }, "RegisterAccountResponse": { email: { required: true, type: () => String }, name: { required: true, type: () => String }, type: { required: true, type: () => Object } }, "LoginAccountRequest": { email: { required: true, type: () => String }, password: { required: true, type: () => String } }, "LoginAccountResponse": { token: { required: true, type: () => String }, isSeller: { required: true, type: () => Boolean } }, "EditProfileRequest": { email: { required: true, type: () => String }, name: { required: true, type: () => String } }, "EditProfileResponse": { email: { required: true, type: () => String }, name: { required: true, type: () => String } }, "SetNotificationRequest": { token: { required: true, type: () => String, nullable: true } }, "EditAvatarRequest": { avatar: { required: true, type: () => Object } }, "ChangePasswordRequest": { currentPassword: { required: true, type: () => String }, newPassword: { required: true, type: () => String } }, "UpdateLocationRequest": { latitude: { required: true, type: () => Number }, longitude: { required: true, type: () => Number }, address: { required: true, type: () => String } }, "UpdateLocationResponse": { latitude: { required: true, type: () => String }, longitude: { required: true, type: () => String } } }], [import("./model/seller.model"), { "SellerDashboardResponse": { name: { required: true, type: () => String }, email: { required: true, type: () => String }, avatar: { required: true, type: () => String }, avatarBlurHash: { required: true, type: () => String }, latitude: { required: true, type: () => String }, longitude: { required: true, type: () => String }, address: { required: true, type: () => String }, subscriber: { required: true, type: () => Number }, products: { required: true } }, "GetSellerDataResponse": { accountId: { required: true, type: () => String }, name: { required: true, type: () => String }, avatar: { required: true, type: () => String }, avatarBlurHash: { required: true, type: () => String }, latitude: { required: true, type: () => String }, longitude: { required: true, type: () => String }, address: { required: true, type: () => String }, subscriber: { required: true, type: () => Number }, products: { required: true, type: () => [Object] } } }], [import("./model/notification.model"), { "NotificationRequest": { to: { required: true, type: () => [String] }, title: { required: true, type: () => String }, body: { required: true, type: () => String }, url: { required: false, type: () => String }, pushKey: { required: true, type: () => String } } }]], "controllers": [[import("./customer/customer.controller"), { "CustomerController": { "getCustomerDashboard": {}, "getAllSubscription": {}, "subscribeToSeller": {}, "unsubscribeFromSeller": {}, "getAllFavorite": {}, "addFavorite": {}, "removeFavorite": {}, "removeAllFavorite": {} } }], [import("./account/account.controller"), { "AccountController": { "getDashboard": {}, "register": {}, "login": {}, "editProfile": {}, "updateNotificationToken": {}, "editAvatar": {}, "deleteAvatar": {}, "changePassword": {}, "location": {}, "logout": {} } }], [import("./seller/seller.controller"), { "SellerController": { "getSellerData": {} } }], [import("./product/product.controller"), { "ProductController": { "search": {}, "all": {}, "create": {}, "update": {}, "deleteById": {}, "searchNearby": {}, "getById": {}, "reActivate": {} } }], [import("./notification/notification.controller"), { "NotificationController": { "send": {} } }]] } };
};