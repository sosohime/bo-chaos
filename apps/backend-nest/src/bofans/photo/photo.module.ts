import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { CategoryService } from '../category/category.service';
import { PrismaService } from '@/library/prisma.service';

@Module({
  providers: [PrismaService, PhotoService, CategoryService],
  controllers: [PhotoController],
})
export class PhotoModule {}
