import request from "../lib/request";
import type { BoDailyCardDto } from "@mono/types";

export type BoDailyCard = BoDailyCardDto;

export function getBoDailyCard() {
  return request.get<BoDailyCard>("/bo/daily-card");
}
