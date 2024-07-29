import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { HaversineModule } from 'src/utils/haversine/haversine.module';
import { ProductRepository } from './product.repository';
import { CustomerRepository } from 'src/customer/customer.repository';
import { SellerRepository } from 'src/seller/seller.repository';

@Module({
  imports: [HaversineModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CustomerRepository,
    SellerRepository,
  ],
  exports: [ProductRepository],
})
export class ProductModule {}
