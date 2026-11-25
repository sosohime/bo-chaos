import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { GroupRankStandaloneModule } from './standalone.module';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const envFile = process.env.GROUP_RANK_ENV_FILE;
  if (envFile && config({ path: envFile, override: true }).error) {
    throw new Error('Unable to load group-ranking environment file');
  }
  const port = Number(process.env.GROUP_RANK_PORT || 3010);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid GROUP_RANK_PORT');
  }
  const app = await NestFactory.create<NestExpressApplication>(
    GroupRankStandaloneModule,
    { bodyParser: false },
  );
  app.useBodyParser('json', { limit: '16kb' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
  await app.listen(port, '127.0.0.1');
}

void bootstrap();
