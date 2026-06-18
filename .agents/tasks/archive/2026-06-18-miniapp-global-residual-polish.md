# Task Record: miniapp global residual polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving remaining mini app surfaces toward a Tencent Cloud style product UI.

## Acceptance Boundaries

- Functional: Preserve photo page loading/refresh behavior, UGC visibility, kowtow sync retry, and shared page/card classes.
- Verification: Build the WeChat mini app, run agent lint, and check whitespace diffs.
- Docs Sync: No architecture or command docs expected for presentation/copy polish.
- Safety: No production writes, no API target changes, no secrets.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Scanned mini app sources for remaining decorative shadows and stiff media/resource/sync terms.
- Reworded history, travel, and tease page headers from media resource to gallery content.
- Reworded kowtow retry warning from sync exception to loading exception while keeping retry behavior unchanged.
- Removed the global `tech-card` shadow so shared card styling matches the thin-border console direction.
- Confirmed the remaining `box-shadow` matches are only explicit `box-shadow: none` resets.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final visual acceptance if the tool window is available.

## Decisions and Assumptions

- Treat remaining `box-shadow: none` rules as explicit resets, not decorative shadows.
- Keep actual local queue sync labels where they describe real pending local data.

## Files Touched

- apps/miniapp-taro/src/app.scss
- apps/miniapp-taro/src/pages/history/index.tsx
- apps/miniapp-taro/src/pages/travel/index.tsx
- apps/miniapp-taro/src/pages/tease/index.tsx
- apps/miniapp-taro/src/pages/kowtow/index.tsx

## Verification Evidence

- `rg -n "box-shadow|媒体资源|同步异常|队列同步|资源同步|资源列表|图片资源|AI|智能|引擎|驾驶舱|中枢|官网|hero|banner|glow|linear-gradient" apps/miniapp-taro/src -g '*.{tsx,scss}'`: only `box-shadow: none` reset rules remain.
- `pnpm exec prettier --write apps/miniapp-taro/src/app.scss apps/miniapp-taro/src/pages/history/index.tsx apps/miniapp-taro/src/pages/travel/index.tsx apps/miniapp-taro/src/pages/tease/index.tsx apps/miniapp-taro/src/pages/kowtow/index.tsx .agents/tasks/active/2026-06-18-miniapp-global-residual-polish.md`: passed.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist stale-data and Node punycode warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no docs update needed because this was source-only presentation/copy polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-global-residual-polish.md`
