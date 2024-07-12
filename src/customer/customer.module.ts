import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { SellerRepository } from 'src/seller/seller.repository';
import { ProductRepository } from 'src/product/product.repository';

@Module({
  controllers: [CustomerController],
  providers: [
    CustomerService,
    CustomerRepository,
    SellerRepository,
    ProductRepository,
  ],
  exports: [CustomerRepository],
})
export class CustomerModule {}
