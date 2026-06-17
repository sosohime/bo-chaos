import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@/library/prisma.service';
import { AdminAuthController, UsersController } from './users.controller';
import { UploadService } from '../upload/upload.service';

@Module({
  providers: [PrismaService, UsersService, UploadService],
  exports: [UsersService],
  controllers: [UsersController, AdminAuthController],
})
export class UsersModule {}
