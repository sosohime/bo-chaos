export interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface PageResponse<T = unknown> {
  data: T[];
  meta: PageMeta;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
