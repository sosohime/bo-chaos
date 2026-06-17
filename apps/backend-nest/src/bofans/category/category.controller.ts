import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsString, MaxLength } from 'class-validator';
import { bofans } from '@mono/const';
import type { CreatePhotoCategoryRequest } from '@mono/types';
import { ok } from '@/common/api-response';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/auth.guard';

class CreateCategoryDto {
  @IsIn(Object.values(bofans.CATEGORY_SYSTEM))
  system!: string;

  @IsString()
  @MaxLength(32)
  systemName!: string;

  @IsString()
  @MaxLength(64)
  name!: string;
}

@Controller('bofans/categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async getCategories() {
    return ok(await this.categoryService.listCategoryDtos());
  }

  @Post()
  @UseGuards(AuthGuard)
  async createCategory(@Body() categoryDto: CreateCategoryDto) {
    return ok(
      await this.categoryService.createCategoryDto(
        categoryDto as CreatePhotoCategoryRequest,
      ),
    );
  }
}
