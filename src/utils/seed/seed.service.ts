import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SeedService {
  constructor(private prismaService: PrismaService) {}

  async seedCategory(): Promise<void> {
    const category = await this.prismaService.category.findMany();

    if (category.length > 0) return;

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
