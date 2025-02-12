import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('bofans/category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('list')
  async getCategories() {
    const categories = await this.categoryService.categories();
    return categories;
  }

  @Post('create')
  async createCategory(
    @Body()
    categoryData: {
      system: string;
      name: string;
      secondCategory: string;
    },
  ) {
    try {
      await this.categoryService.createCategory(categoryData);
      return true;
    } catch {
      return false;
    }
  }
}
