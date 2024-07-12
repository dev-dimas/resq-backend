import { Module } from '@nestjs/common';
import { HaversineService } from './haversine.service';

@Module({
  providers: [HaversineService],
  exports: [HaversineService],
})
export class HaversineModule {}
