import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { Prisma } from '@mono/prisma-client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async categories({ all }: { all?: boolean }) {
    if (all) {
      return this.prisma.category.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }
    return this.prisma.category.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({
      data,
    });
  }

  async findCategory(where: Prisma.CategoryWhereInput) {
    return this.prisma.category.findFirst({ where });
  }
}
