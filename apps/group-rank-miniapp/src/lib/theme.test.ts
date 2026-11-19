import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, expect, it, vi } from "vitest";
const wx = vi.hoisted(() => ({ setNavigationBarColor: vi.fn() }));
vi.mock("@tarojs/taro", () => ({ default: wx }));
import { crownForRank, syncNavigationTheme, themeId } from "./theme";
beforeEach(() => vi.resetAllMocks());
it("uses a safe default theme and does not invent medals for other ranks", () => {
  expect(themeId("unrecognized")).toBe("volt");
  expect(crownForRank(4)).toBeUndefined();
  expect(crownForRank(1)).toContain("crown-gold");
});
it("keeps graphite navigation across board themes and absorbs native failures", async () => {
  wx.setNavigationBarColor.mockRejectedValueOnce(new Error("not ready"));
  expect(() => syncNavigationTheme("midnight")).not.toThrow();
  await Promise.resolve();
  syncNavigationTheme("volt");
  expect(wx.setNavigationBarColor).toHaveBeenLastCalledWith({
    frontColor: "#ffffff",
    backgroundColor: "#11171b",
  });
  wx.setNavigationBarColor.mockImplementationOnce(() => {
    throw new Error("unsupported");
  });
  expect(() => syncNavigationTheme("coral")).not.toThrow();
});

it("keeps material backgrounds compatible with packaged WeChat styles", () => {
  const source = readFileSync(resolve(__dirname, "../app.scss"), "utf8");
  expect(source).not.toMatch(/url\(["']?\/?assets\//);
  expect(source).toContain('--page-bg:#0a1015');
  expect(source).not.toContain('--notebook-paper');
});
