import type { GroupRankEntryDto, GroupRankTemplate } from "@mono/types";
export function singleRecord(template: GroupRankTemplate, entries: GroupRankEntryDto[], now = new Date()) {
  if (template.entryMode !== "single") return null;
  const chinaNow = new Date(now.getTime() + 8 * 3600000);
  const start = Date.UTC(chinaNow.getUTCFullYear(), chinaNow.getUTCMonth(), 1) - 8 * 3600000;
  return entries.find(entry => template.period === "all_time" || Date.parse(entry.createdAt) >= start) || null;
}
