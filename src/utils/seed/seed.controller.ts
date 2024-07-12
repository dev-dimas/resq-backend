import { Controller, HttpCode, Patch } from '@nestjs/common';
import { WebResponse } from 'src/model/web.model';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('db')
export class SeedController {
  constructor(private seedService: SeedService) {}

  @Patch('seed')
  @HttpCode(201)
  @ApiTags('DB')
  async seed(): Promise<WebResponse> {
    await this.seedService.seedCategory();
    return { message: 'Seeding success' };
  }
}
