import type { CSSProperties } from "react";
import type { GroupRankThemeId } from "@mono/types";

export const paletteColors = [
  { name: "酸绿", value: "#BAFF00" },
  { name: "橙色", value: "#FF8000" },
  { name: "钴蓝", value: "#398AFF" },
  { name: "玫红", value: "#F65D9B" },
  { name: "紫色", value: "#A685FF" },
  { name: "青色", value: "#39C5BB" },
  { name: "金色", value: "#F2CC60" },
];
export function validColor(color?: string | null): string | null {
  return typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : null;
}
export function themeColor(theme: GroupRankThemeId) {
  return theme === "coral" ? "#FF8000" : theme === "midnight" ? "#398AFF" : "#BAFF00";
}
const rgb = (color: string) => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
export function paletteStyle(color?: string | null): CSSProperties {
  const value = validColor(color);
  if (!value) return {};
  const channels = rgb(value);
  const luminanceOf = (items: number[]) => {
    const c = items.map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; });
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  };
  const luminance = luminanceOf(channels);
  const soft = channels.map(c => Math.round(c * .16 + 14));
  const surface = Math.max(luminanceOf([25,31,38]), luminanceOf(soft));
  let readable = channels;
  for (let blend = .05; (luminanceOf(readable) + .05) / (surface + .05) < 4.5 && blend <= 1.001; blend += .05)
    readable = channels.map(c => Math.round(c + (255 - c) * blend));
  const readableHex = "#" + readable.map(c => c.toString(16).padStart(2,"0")).join("").toUpperCase();
  return {
    "--accent": value,
    "--brand": value,
    "--accent-readable": readableHex,
    "--accent-icon-filter": luminance > .179 ? "brightness(0)" : "brightness(0) invert(1)",
    "--accent-ink": luminance > .179 ? "#000000" : "#FFFFFF",
    "--accent-soft": `rgb(${soft.join(",")})`,
  } as CSSProperties;
}
export function colorToHsl(color: string) {
  const [r, g, b] = rgb(validColor(color) || "#BAFF00").map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const light = (max + min) / 2;
  let hue = 0;
  if (delta) hue = (max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60;
  return { hue: Math.round(hue) % 360, light: Math.round(light * 100) };
}
/** Saturation is fixed for coherent vivid accents; brightness remains user-controlled. */
export function hslColor(hue: number, light: number) {
  const l = Math.min(90, Math.max(10, light)) / 100;
  const a = .85 * Math.min(l, 1 - l);
  return "#" + [0, 8, 4].map(n => {
    const k = (n + ((hue % 360 + 360) % 360) / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0");
  }).join("").toUpperCase();
}
