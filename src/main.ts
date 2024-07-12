import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const configSwagger = new DocumentBuilder()
    .setTitle('Resq API')
    .setDescription('Resq API Documentation')
    .setContact(
      'Dimas Octa Maulana',
      'https://dimaslabs.com',
      'dev.dimasmaulana@gmail.com',
    )
    .addBearerAuth()
    .setVersion(version || '')
    .build();

  const swaggerTheme = new SwaggerTheme();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('/', app, document, {
    customfavIcon: '/assets/favicon.ico',
    customSiteTitle: 'Resq API',
    customCss:
      swaggerTheme.getBuffer(SwaggerThemeNameEnum.ONE_DARK) +
      ".topbar-wrapper {content:url('/assets/favicon.png'); width:100px; height:auto;}" +
      '.topbar-wrapper svg { visibility: hidden; }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  await app.listen(3000);
}
bootstrap();
