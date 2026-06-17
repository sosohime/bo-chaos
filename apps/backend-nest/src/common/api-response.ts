import type { ApiResponse, PageMeta, PageResponse } from '@mono/types';

export function ok<T>(data: T): ApiResponse<T> {
  return { data };
}

export function page<T>(data: T[], meta: PageMeta): PageResponse<T> {
  return { data, meta };
}
