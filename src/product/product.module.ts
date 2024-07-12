import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { HaversineModule } from 'src/utils/haversine/haversine.module';
import { ProductRepository } from './product.repository';
import { CustomerRepository } from 'src/customer/customer.repository';

@Module({
  imports: [HaversineModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, CustomerRepository],
  exports: [ProductRepository],
})
export class ProductModule {}
