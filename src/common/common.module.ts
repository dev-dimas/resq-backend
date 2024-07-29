import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthMiddleware } from './auth.middleware';
import { ErrorFilter } from './error.filter';
import { PrismaService } from './prisma.service';
import { ImageService } from './image.service';
import { ValidationService } from './validation.service';
import { NotificationService } from './notification.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
  ],
  providers: [
    ImageService,
    NotificationService,
    PrismaService,
    ValidationService,
    { provide: APP_FILTER, useClass: ErrorFilter },
  ],
  exports: [
    ImageService,
    NotificationService,
    PrismaService,
    ValidationService,
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
