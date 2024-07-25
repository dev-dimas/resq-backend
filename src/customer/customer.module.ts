import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { SellerRepository } from 'src/seller/seller.repository';
import { ProductRepository } from 'src/product/product.repository';
import { HaversineService } from 'src/utils/haversine/haversine.service';

@Module({
  controllers: [CustomerController],
  providers: [
    CustomerService,
    CustomerRepository,
    HaversineService,
    SellerRepository,
    ProductRepository,
  ],
  exports: [CustomerRepository, CustomerService],
})
export class CustomerModule {}
