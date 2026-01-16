import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const corsOrigin =
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ??
    'http://localhost:3000';
  const corsCredentials = process.env.CORS_CREDENTIALS === 'true';

  app.enableCors({
    origin: corsOrigin,
    credentials: corsCredentials,
  });

  logger.log(
    `CORS enabled for ${Array.isArray(corsOrigin) ? corsOrigin.join(', ') : corsOrigin}`,
  );

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
