import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SeedService } from './utils/seed/seed.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private seedService: SeedService) {}

  async onApplicationBootstrap(): Promise<any> {
    await this.seedService.cleanSeed();
    await this.seedService.seedAdmin();
    await this.seedService.seedCategory();
    await this.seedService.seedSellerAndProdyct();
  }
}
