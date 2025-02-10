import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@/library/prisma.service';

@Module({
  providers: [PrismaService, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
