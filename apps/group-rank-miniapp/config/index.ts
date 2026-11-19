import { defineConfig } from "@tarojs/cli";

const apiBase = (process.env.GROUP_RANK_API_BASE_URL || "").replace(/\/$/, "");
if (apiBase && new URL(apiBase).protocol !== "https:") {
  throw new Error("GROUP_RANK_API_BASE_URL must use HTTPS");
}

export default defineConfig({
  projectName: "group-rank-miniapp",
  date: "2026-10-26",
  designWidth: 375,
  deviceRatio: { 375: 2, 640: 2.34 / 2, 750: 1, 828: 1.81 / 2 },
  sourceRoot: "src",
  defineConstants: { GROUP_RANK_API_BASE_URL: JSON.stringify(apiBase) },
  outputRoot: "dist",
  copy: {
    patterns: [
      {from:"design/art-direction/electric-arena-v1/fonts/ArenaDisplay-OFL.txt",to:"dist/assets/ArenaDisplay-OFL.txt"},
      {from:"src/assets/brand/boge-smile.png",to:"dist/assets/brand/boge-smile.png"},
      { from: "src/assets/brand/boge-writing.jpg", to: "dist/assets/brand/boge-writing.jpg" },
      ...["gold","silver","bronze"].map(name => ({from:`src/assets/arena/crown-${name}-v1.png`,to:`dist/assets/arena/crown-${name}-v1.png`})),
      ...["catalog-title", "brand-title", "catalog-star-v2", "hero-ribbon-v3"].map((name) => ({
        from: `src/assets/arena/${name}.png`,
        to: `dist/assets/arena/${name}.png`,
      })),
      ...["crystal", "track", "pixel", "crystal-card-v3", "track-card-v1", "pixel-card-v4"].map((name) => ({
        from: `src/assets/arena/${name}.jpg`,
        to: `dist/assets/arena/${name}.jpg`,
      })),
      { from: "src/assets/share-cover.jpg", to: "dist/assets/share-cover.jpg" },
      ...[
        "gamepad-2",
        "dumbbell",
        "footprints",
        "trophy",
        "pencil",
        "users",
        "chevron-right",
        "message-circle",
        "group-chat",
      ].map((name) => ({
        from: `src/assets/notebook/icon-${name}.png`,
        to: `dist/assets/notebook/icon-${name}.png`,
      })),
      {
        from: "src/assets/premium/icon-pencil-inverse.png",
        to: "dist/assets/premium/icon-pencil-inverse.png",
      },
    ],
  },
  framework: "react",
  compiler: { type: "webpack5", prebundle: { enable: false } },
  cache: { enable: false },
  mini: {
    postcss: { pxtransform: { enable: true }, "./config/container-units.cjs": { enable: true }, cssModules: { enable: false } },
  },
});
