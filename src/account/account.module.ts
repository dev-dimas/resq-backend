import { Module } from '@nestjs/common';
import { CustomerModule } from 'src/customer/customer.module';
import { AccountController } from './account.controller';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { SellerModule } from 'src/seller/seller.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [CustomerModule, SellerModule, AdminModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountRepository],
})
export class AccountModule {}
