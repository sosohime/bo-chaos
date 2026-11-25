import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, "../../apps/backend-nest");
const backendRequire = createRequire(path.join(backendRoot, "package.json"));
const miniRequire = createRequire(
  path.resolve(here, "../../apps/group-rank-miniapp/package.json"),
);
const buildRequire = createRequire(
  miniRequire.resolve("@tarojs/webpack5-runner"),
);
const postcss = buildRequire("postcss");
const pxtransform = buildRequire("postcss-pxtransform");
const containerUnits = miniRequire(path.resolve(here, "../../apps/group-rank-miniapp/config/container-units.cjs"));
// Match the WeChat build's 375-design-pixel -> 750rpx pipeline before rendering in a browser.
// Physical `Px` breakpoints stay physical; runtime API measurements stay pixel CSS variables.
const nativeUnits = {
  postcssPlugin: "preview-weapp-units",
  async Once(root, { result }) {
    if (!result.opts.from?.includes("/apps/group-rank-miniapp/src/")) return;
    const native = await postcss([
      pxtransform({
        platform: "weapp",
        designWidth: 375,
        deviceRatio: { 375: 2 },
      }),
      containerUnits(),
    ]).process(root.toString(), { from: result.opts.from });
    root.removeAll();
    root.append(native.root.nodes);
    // Native page variables inherit across every page theme and RootPortal.
    root.walkRules(rule => { rule.selector = rule.selector.split(",").map(selector => selector.trim() === "page" ? ":root" : selector).join(","); });
    root.walkDecls((decl) => {
      decl.value = decl.value.replace(
        /env\(safe-area-inset-bottom\)/g,
        "var(--preview-safe-bottom, 0px)",
      );
    });
  },
};
backendRequire("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "commonjs", moduleResolution: "node" },
});
const rendererPath = path.join(backendRoot, "src/group-rank/title-art-renderer.ts");
const supportPath = path.join(backendRoot, "src/group-rank/title-art-font.ts");
let titleGeneration = 0;
let renderer;
let titleSupport;
const titleCache = new Map();
function reloadTitleRenderer() {
  // Vite config reloads do not clear CommonJS modules loaded through createRequire.
  delete backendRequire.cache[backendRequire.resolve(rendererPath)];
  delete backendRequire.cache[backendRequire.resolve(supportPath)];
  renderer = backendRequire(rendererPath);
  titleSupport = backendRequire(supportPath);
  titleGeneration += 1;
  titleCache.clear();
}
reloadTitleRenderer();
const titlePreview = {
  name: "design-only-title-art",
  configureServer(server) {
    const watched = new Set([rendererPath, supportPath, renderer.TITLE_FONT_FILE]);
    server.watcher.add([...watched]);
    const onTitleChange = (file) => {
      if (!watched.has(file)) return;
      reloadTitleRenderer();
      server.ws.send({ type: "full-reload" });
    };
    server.watcher.on("change", onTitleChange);
    server.httpServer?.once("close", () => server.watcher.off("change", onTitleChange));
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname.startsWith("/__design/avatar-")) {
        const filename = url.pathname.slice("/__design/".length);
        if (!/^avatar-[1-5]\.png$/.test(filename)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        try {
          res.setHeader("Content-Type", "image/png");
          res.end(await fs.readFile(path.join(here, "fixtures", filename)));
        } catch {
          res.statusCode = 404;
          res.end();
        }
        return;
      }
      if (url.pathname !== "/__design/title-art") return next();
      const name = url.searchParams.get("name") || "";
      if (!name || Array.from(name).length > 24) {
        res.statusCode = 400;
        res.end();
        return;
      }
      try {
        const generation = titleGeneration;
        const currentRenderer = renderer;
        const currentSupport = titleSupport;
        const cacheKey = `${generation}:${currentRenderer.TITLE_ART_VERSION}:${name}`;
        let art = titleCache.get(cacheKey);
        if (!art) {
          const supported = await currentSupport.supportsTitle(name);
          const r = supported
            ? await currentRenderer.renderTitleArt(name)
            : { width: 0, height: 0, image: null };
          art = {
            name,
            width: r.width,
            height: r.height,
            imageDataUri: r.image
              ? "data:image/png;base64," + r.image.toString("base64")
              : null,
            version: currentRenderer.TITLE_ART_VERSION,
          };
          // A font/source edit during rendering must not refill the new generation's cache.
          if (generation !== titleGeneration) {
            res.statusCode = 503;
            res.end();
            return;
          }
          if (titleCache.size > 30) titleCache.clear();
          titleCache.set(cacheKey, art);
        }
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(art));
      } catch {
        res.statusCode = 503;
        res.end();
      }
    });
  },
};
export default defineConfig({
  root: here,
  server: {
    host: "127.0.0.1",
    port: 5198,
    strictPort: true,
    fs: { allow: [path.resolve(here, "../..")] },
  },
  resolve: {
    alias: [
      {
        find: "@tarojs/components",
        replacement: path.join(here, "components.tsx"),
      },
      { find: "@tarojs/taro", replacement: path.join(here, "taro.ts") },
    ],
  },
  plugins: [
    titlePreview,
    {
      name: "preview-notebook-corner",
      enforce: "pre",
      resolveId(id, importer) {
        if (id === "./notebook-corner" && importer?.endsWith("/components/page-corner.tsx"))
          return path.join(here, "preview-notebook-corner.tsx");
      },
      transform(code, id) {
        if (id.endsWith("/native/notebook-corner/fold.wxs"))
          return `const getDate = () => new Date();\n${code.replace("module.exports =", "export default")}`;
      },
    },
    {
      name: "preview-api-isolation",
      enforce: "pre",
      resolveId(id, importer) {
        if (
          importer?.includes("/apps/group-rank-miniapp/src/") &&
          /(?:^|\/)lib\/(api|entry)$/.test(id)
        )
          return path.join(here, id.endsWith("/api") ? "api.ts" : "entry.ts");
      },
    },
  ],
  publicDir: path.resolve(here, "../../apps/group-rank-miniapp/src"),
  css: { postcss: { plugins: [nativeUnits] } },
  esbuild: { jsx: "automatic" },
});
