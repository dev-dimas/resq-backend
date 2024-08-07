import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    let token = req.headers['authorization'] as string;

    if (token) {
      if (token.includes('Bearer ')) {
        token = token.split(' ')[1];
      }
      const user = await this.prismaService.account.findFirst({
        where: {
          token: token,
          isActive: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  }
}
