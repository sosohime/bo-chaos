import { apiFetch } from "@/lib/api-client";
import type { CreatePhotoCategoryRequest, PhotoCategoryDto } from "@mono/types";

export async function getCategories(): Promise<PhotoCategoryDto[]> {
  const response = await apiFetch<PhotoCategoryDto[]>("/categories");
  return response?.data || [];
}

export async function createCategory(
  data: CreatePhotoCategoryRequest,
): Promise<PhotoCategoryDto> {
  const response = await apiFetch<PhotoCategoryDto>("/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.data;
}
