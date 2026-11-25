import Taro from "@tarojs/taro";
import type { GroupRankThemeId } from "@mono/types";

export const themes: {
  id: GroupRankThemeId;
  name: string;
  description: string;
}[] = [
  { id: "volt", name: "晶体", description: "晶体 · 酸绿" },
  { id: "coral", name: "赛道", description: "赛道 · 橙色" },
  { id: "midnight", name: "像素", description: "像素 · 钴蓝" },
];
export function themeId(value?: string | null): GroupRankThemeId {
  return value === "midnight" || value === "coral" ? value : "volt";
}
/** Official examples carry a suggested look into the editable creation preview. */
export function templateTheme(item: { id: string; themeId?: GroupRankThemeId }): GroupRankThemeId {
  if (item.themeId) return themeId(item.themeId);
  return item.id === "running-distance" ? "coral" : item.id === "game-score" ? "midnight" : "volt";
}
export function crownForRank(rank: number) {
  return rank === 1
    ? "/assets/premium/crown-gold.png"
    : rank === 2
      ? "/assets/premium/crown-silver.png"
      : rank === 3
        ? "/assets/premium/crown-bronze.png"
        : undefined;
}

export function syncNavigationTheme(_value?: string | null) {
  if (typeof Taro.setNavigationBarColor !== "function") return;
  // The graphite navigation belongs to the shared shell, independent of board ink.
  try {
    const result = Taro.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#11171b",
    });
    if (result && typeof result.catch === "function")
      void result.catch(() => {});
  } catch {
    /* Navigation cosmetics must never interrupt a score or profile action. */
  }
}
