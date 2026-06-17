import request from "../lib/request";
import type { PhotoCategoryDto } from "@mono/types";

export function getCategories() {
  return request.get<PhotoCategoryDto[]>("/categories");
}
