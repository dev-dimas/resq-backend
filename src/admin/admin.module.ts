import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { AccountRepository } from 'src/account/account.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, AccountRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
