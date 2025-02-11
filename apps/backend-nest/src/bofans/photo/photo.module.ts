import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { PrismaService } from '@/library/prisma.service';

@Module({
  providers: [PrismaService, PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
