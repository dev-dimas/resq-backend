import { Module } from '@nestjs/common';
import { CustomerModule } from 'src/customer/customer.module';
import { AccountController } from './account.controller';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { SellerModule } from 'src/seller/seller.module';

@Module({
  imports: [CustomerModule, SellerModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountRepository],
})
export class AccountModule {}
