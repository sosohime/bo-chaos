import { Module } from '@nestjs/common';
import { KowtowController } from './kowtow.controller';
import { KowtowService } from './kowtow.service';
import { PrismaService } from '@/library/prisma.service';

@Module({
  providers: [PrismaService, KowtowService],
  controllers: [KowtowController],
})
export class KowtowModule {}
