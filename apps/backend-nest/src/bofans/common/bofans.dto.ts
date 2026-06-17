import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { bofans } from '@mono/const';

export const categorySystems = Object.values(bofans.CATEGORY_SYSTEM);
export const photoStatuses = Object.values(bofans.PHOTO_STATUS);

export class CategorySystemDto {
  @IsIn(categorySystems)
  system!: string;
}

export class OptionalCategorySystemDto {
  @IsOptional()
  @IsIn(categorySystems)
  system?: string;
}

export class OptionalStringDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  value?: string;
}
