import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

// Use the app's actual build dependencies, not a browser-only CSS approximation.
const appRoot = existsSync(resolve(process.cwd(), "src/app.config.ts"))
  ? process.cwd()
  : resolve(process.cwd(), "apps/group-rank-miniapp");
const miniRequire = createRequire(resolve(appRoot, "package.json"));
const buildRequire = createRequire(
  miniRequire.resolve("@tarojs/webpack5-runner"),
);
const sass = buildRequire("sass");
const postcss = buildRequire("postcss");
const pxtransform = buildRequire("postcss-pxtransform");
const containerUnits = miniRequire(resolve(appRoot, "config/container-units.cjs"));
async function nativeCss(relative: string): Promise<string> {
  const source = resolve(appRoot, "src/lib", relative);
  const compiled = sass.compile(source, { style: "expanded" }).css;
  const result = await postcss([
    pxtransform({
      platform: "weapp",
      designWidth: 375,
      deviceRatio: { 375: 2 },
    }),
    containerUnits(),
  ]).process(compiled, { from: source });
  return result.css;
}
it("keeps narrow-screen breakpoints in physical pixels through the native build pipeline", async () => {
  for (const path of [
    "../components/score-value.scss",
    "../components/scoreboard.scss",
  ]) {
    const css = await nativeCss(path);
    expect(css).toMatch(/@media\s*\(max-width:\s*350px\)/i);
    expect(css).not.toMatch(/@media\s*\(max-width:\s*700rpx\)/i);
    expect(css).toContain("var(--ui-unit"); // Component dimensions use the same live canvas as JS motion.
    expect(css).not.toMatch(/\d+rpx/);
  }
});
it("keeps original brand photo and variable photos in native Image layers", async () => {
  const css = await nativeCss("../app.scss");
  expect(css).toContain("data:font/woff2;base64,");
  expect(css).not.toContain("data:image/png;base64,"); // Original smile and user images stay independent native Images.
  const layer = readFileSync(resolve(appRoot,"src/components/arena-background.tsx"),"utf8");
  expect(layer).toContain('mode={cropVersion ? "aspectFill" : "scaleToFill"}');
  expect(layer).toContain("cropGeometry");
  expect(css).not.toMatch(/url\(["']?\/?(?:assets|\.\.?\/)[^)]*\.(?:jpg|png)/i);
});

it("uses one custom native header and preserves measured physical-pixel CSS variables", async () => {
  for (const page of ["index", "board", "create"]) {
    const config = readFileSync(
      resolve(appRoot, `src/pages/${page}/index.config.ts`),
      "utf8",
    );
    expect(config).toMatch(/navigationStyle:\s*["']custom["']/);
    expect(config).toMatch(/enablePageMeta:\s*true/);
  }
  const css = await nativeCss("../components/page-frame.scss");
  expect(css).toContain("var(--page-status-height");
  expect(css).toContain("var(--page-capsule-clearance");
  expect(css).toContain("var(--page-header-height");
});

it("gives root-portal sheets their own theme and an opaque surface above page chrome", async () => {
  const appCss = postcss.parse(await nativeCss("../app.scss"));
  for (const theme of ["volt", "coral", "midnight"]) {
    const tokens = new Map<string, string>();
    appCss.walkRules((rule: any) => {
      if (rule.selector.split(",").map((selector: string) => selector.trim()).includes(`.theme--${theme}`))
        rule.walkDecls((decl: any) => { tokens.set(decl.prop, decl.value); });
    });
    expect(tokens.get("--text-primary")).toBe("#f3f5f3");
    expect(tokens.get("--surface")).toBe("#191f26");
    expect(tokens.get("--border")).toBeTruthy();
    expect(tokens.get("--display-font")).toBeTruthy();
    expect(tokens.get("--accent")).toBeTruthy();
  }
  const css = await nativeCss("../components/profile.scss");
  const root = postcss.parse(css);
  const rules = root.nodes.filter((node: any) => node.type === "rule");
  const masks = rules.filter((node: any) => node.selector.split(",").some((selector: string) => selector.trim() === ".profile-mask"));
  const values = new Map(masks.flatMap((node: any) => node.nodes.filter((item: any) => item.type === "decl").map((item: any) => [item.prop, item.value])));
  expect(values.has("--notebook-paper")).toBe(false);
  expect(Number(values.get("z-index"))).toBeGreaterThan(42);
  const sheet = rules.find((node: any) => node.selector === ".profile-sheet");
  expect(sheet.nodes.find((item: any) => item.prop === "background")?.value).toBe("#191f26");
  expect(sheet.nodes.find((item: any) => item.prop === "height")?.value).toBe("var(--sheet-height)");
  const body = rules.find((node: any) => node.selector === ".profile-sheet-body");
  expect(body.nodes.find((item: any) => item.prop === "height")?.value).toBe("0");
  expect(body.nodes.find((item: any) => item.prop === "flex")?.value).toBe("1");

  // WeChat webview scroll-view ignores padding; inset the ordinary inner view.
  for (const rule of rules.filter((node: any) => node.selector.includes("profile-sheet-body")))
    expect(rule.nodes.some((item: any) => /^padding(?:-|$)/.test(item.prop))).toBe(false);
  const content = rules.find((node: any) => node.selector === ".profile-sheet-content");
  expect(content.nodes.some((item: any) => item.prop === "padding")).toBe(true);
});

it("keeps physical touch sizes, nested calc and embedded font URLs intact", async () => {
  const css='.test{width:88px;min-height:44Px;left:calc(100% - 12px);font-family:demo;src:url("data:font/woff2;base64,88rpx==")}';
  const result=await postcss([pxtransform({platform:"weapp",designWidth:375,deviceRatio:{375:2}}),containerUnits()]).process(css,{from:undefined});
  expect(result.css).toContain("width:calc(var(--ui-unit, 1px) * 88)");
  expect(result.css).toMatch(/min-height:44px/i);
  expect(result.css).toContain("calc(100% - calc(var(--ui-unit, 1px) * 12))");
  expect(result.css).toContain('url("data:font/woff2;base64,88rpx==")');
});

it("packages the complete original Boge smile and styles only its surrounding frame", async () => {
  const original = readFileSync(resolve(appRoot,"design/logo/boge-smile-reference.png"));
  expect(readFileSync(resolve(appRoot,"src/assets/brand/boge-smile.png")).equals(original)).toBe(true);
  const mark = readFileSync(resolve(appRoot,"src/components/brand-mark.tsx"),"utf8");
  expect(mark).toContain('mode="aspectFit"');
  expect(mark).toContain('/assets/brand/boge-smile.png');
  const root=postcss.parse(await nativeCss("../components/brand-mark.scss"));
  root.walkRules((rule:any)=>{
    if(rule.selector.includes("brand-mini-photo")) rule.walkDecls((decl:any)=>{
      expect(["filter","transform","clip-path","object-position"]).not.toContain(decl.prop);
    });
  });
});
