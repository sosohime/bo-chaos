import { expect, it } from "vitest";
import { podiumCollapsed } from "./podium-motion";

it("uses a 12px return band so small reverse scrolls do not oscillate", () => {
  let compact = false;
  for (const top of [0, 40, 88, 89, 88, 84, 78]) compact = podiumCollapsed(compact, top, 89);
  expect(compact).toBe(true);
  expect(podiumCollapsed(compact, 77, 89)).toBe(false);
});
it("uses the actual physical height difference for short, tall and scaled covers", () => {
  for (const threshold of [35, 89, 184, 89 * 320 / 375]) {
    expect(podiumCollapsed(false, threshold - 1, threshold)).toBe(false);
    expect(podiumCollapsed(false, threshold, threshold)).toBe(true);
  }
  expect(podiumCollapsed(false, 11, -20)).toBe(false);
  expect(podiumCollapsed(false, 12, -20)).toBe(true);
});
