import { Module } from '@nestjs/common';
import { AccountTestService } from './account/account-test.service';

@Module({
  providers: [AccountTestService],
})
export class TestModule {}
