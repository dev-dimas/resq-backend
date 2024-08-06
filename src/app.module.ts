import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { AccountModule } from './account/account.module';
import { CommonModule } from './common/common.module';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';
import { HaversineModule } from './utils/haversine/haversine.module';
import { SeedModule } from './utils/seed/seed.module';
import { SellerModule } from './seller/seller.module';
import { NotificationModule } from './notification/notification.module';
import { AppService } from './app.service';

@Module({
  imports: [
    AccountModule,
    CommonModule,
    CustomerModule,
    HaversineModule,
    ProductModule,
    SeedModule,
    ServeStaticModule.forRoot({
      serveRoot: '/uploads/',
      rootPath: path.join(__dirname, '..', 'uploads'),
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/assets/',
      rootPath: path.join(__dirname, '..', 'assets'),
    }),
    SellerModule,
    NotificationModule,
  ],
  providers: [AppService],
})
export class AppModule {}
