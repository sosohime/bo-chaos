import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 60;

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize = DEFAULT_PAGE_SIZE;
}

export function getPagination(dto: PaginationDto) {
  const page = Math.max(Number(dto.page) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number(dto.pageSize) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}
