import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { CategorySystem, PhotoCategory, Prisma } from '@mono/prisma-client';
import type { CreatePhotoCategoryRequest, PhotoCategoryDto } from '@mono/types';
import { bofans } from '@mono/const';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async listCategoryDtos(): Promise<PhotoCategoryDto[]> {
    const categories = await this.prisma.photoCategory.findMany({
      orderBy: [{ system: 'asc' }, { updatedAt: 'desc' }],
    });
    return categories.map(mapCategory);
  }

  async createCategoryDto(
    data: CreatePhotoCategoryRequest,
  ): Promise<PhotoCategoryDto> {
    const category = await this.createCategory({
      system: toCategorySystem(data.system),
      systemName: data.systemName,
      name: data.name,
      author: { connect: { openId: 'system' } },
    });
    return mapCategory(category);
  }

  async createOrFindUserCategory(params: {
    system: string;
    name: string;
    authorOpenId: string;
  }) {
    const system = toCategorySystem(params.system);
    const existing = await this.prisma.photoCategory.findUnique({
      where: {
        system_name: {
          system,
          name: params.name,
        },
      },
    });
    if (existing) return existing;
    return this.createCategory({
      system,
      systemName:
        bofans.CATEGORY_SYSTEM_NAME[
          params.system as keyof typeof bofans.CATEGORY_SYSTEM_NAME
        ],
      name: params.name,
      author: { connect: { openId: params.authorOpenId } },
    });
  }

  async createCategory(data: Prisma.PhotoCategoryCreateInput) {
    return this.prisma.photoCategory.create({ data });
  }

  async findCategory(where: Prisma.PhotoCategoryWhereInput) {
    return this.prisma.photoCategory.findFirst({ where });
  }
}

export function toCategorySystem(system: string): CategorySystem {
  if (system === bofans.CATEGORY_SYSTEM.TRAVEL) return CategorySystem.TRAVEL;
  if (system === bofans.CATEGORY_SYSTEM.TEASE) return CategorySystem.TEASE;
  return CategorySystem.HISTORY;
}

export function fromCategorySystem(system: CategorySystem): string {
  if (system === CategorySystem.TRAVEL) return bofans.CATEGORY_SYSTEM.TRAVEL;
  if (system === CategorySystem.TEASE) return bofans.CATEGORY_SYSTEM.TEASE;
  return bofans.CATEGORY_SYSTEM.HISTORY;
}

export function mapCategory(category: PhotoCategory): PhotoCategoryDto {
  return {
    id: category.id,
    system: fromCategorySystem(category.system) as PhotoCategoryDto['system'],
    systemName: category.systemName,
    name: category.name,
    updatedAt: category.updatedAt.toISOString(),
  };
}
