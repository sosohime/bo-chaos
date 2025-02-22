import request from "../lib/request";
import { BofansSystemConfigType } from "@mono/types";

export function getSystemConfig() {
  return request.get<BofansSystemConfigType>(`/global/systemConfig`);
}
