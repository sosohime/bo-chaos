import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@/library/prisma.service';
import { UsersController } from './users.controller';

@Module({
  providers: [PrismaService, UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
