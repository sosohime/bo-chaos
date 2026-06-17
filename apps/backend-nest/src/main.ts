import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { env } from './const/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  if (env.CORS_ORIGINS.length > 0) {
    app.enableCors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
