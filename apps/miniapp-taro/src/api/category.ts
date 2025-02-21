import request from "../lib/request";

export function getCategories() {
  return request.get("/category/list");
}
