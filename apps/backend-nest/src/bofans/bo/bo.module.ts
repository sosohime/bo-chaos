import { Module } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { BoController } from './bo.controller';
import { BoService } from './bo.service';

@Module({
  providers: [PrismaService, BoService],
  controllers: [BoController],
})
export class BoModule {}
