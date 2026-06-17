import request from "../lib/request";
import type { KowtowStatsDto } from "@mono/types";

export function getKowtowStats() {
  return request.get<KowtowStatsDto>("/kowtows/stats");
}

export function kowtowOnce() {
  return request.post<boolean>("/kowtows");
}

export function batchKowtow(data: { count: number }): Promise<void> {
  return request.post("/kowtows", data);
}
