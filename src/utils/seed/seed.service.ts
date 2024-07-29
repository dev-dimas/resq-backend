import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { Logger } from 'winston';

@Injectable()
export class SeedService {
  constructor(
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async seedCategory(): Promise<void> {
    const category = await this.prismaService.category.findMany();

    if (category.length > 0) {
      this.logger.info('Category already seeded');
      return;
    }

    await this.prismaService.category.createMany({
      data: [
        { name: 'Makanan' },
        { name: 'Minuman' },
        { name: 'Salad' },
        { name: 'Dessert' },
      ],
    });
  }
}
