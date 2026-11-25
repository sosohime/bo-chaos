import { expect, it } from "vitest";
import { hslColor, paletteStyle, validColor } from "./palette";

it("accepts only complete hex colors as CSS tokens", () => {
  expect(validColor("#f65d9b")).toBe("#F65D9B");
  for (const color of ["red", "#fff", "url(x)", "#123456;--x:red", "#12345678"])
    expect(paletteStyle(color)).toEqual({});
});
it("chooses text with at least4.5 contrast across every hue and supported brightness", () => {
  for (let hue = 0; hue < 360; hue += 5) for (let light = 10; light <= 90; light += 5) {
    const color = hslColor(hue, light);
    const style = paletteStyle(color) as Record<string, string>;
    const c = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    const luminance = c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
    const contrast = style["--accent-ink"] === "#000000" ? (luminance + .05) / .05 : 1.05 / (luminance + .05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    const lum = (items:number[]) => { const c = items.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return c[0]*.2126+c[1]*.7152+c[2]*.0722; };
    const readable = style["--accent-readable"];
    const readableLum = lum([1,3,5].map(i => parseInt(readable.slice(i,i+2),16)));
    const base = [1,3,5].map(i => parseInt(color.slice(i,i+2),16));
    const surface = Math.max(lum([25,31,38]),lum(base.map(c => Math.round(c*.16+14))));
    expect((readableLum+.05)/(surface+.05)).toBeGreaterThanOrEqual(4.5);
  }
});
