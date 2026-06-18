# Task Record: miniapp kowtow operation chrome refine

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app interaction page toward a Tencent Cloud style product UI without fake service-console language.

## Acceptance Boundaries

- Functional: Preserve stats polling, local count queue, batch sync, canvas feedback, swiper preview, review-mode fallback, and submit behavior.
- Verification: Build the WeChat mini app, run agent lint, and check whitespace diffs.
- Docs Sync: No architecture or command docs expected for presentation/copy polish.
- Safety: No production writes, no API target changes, no secrets.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Diagnosed the kowtow page as still using stiff service/node/resource labels and shadowed panels that read like a fake console wrapper.
- Replaced fake service/node/resource labels with interaction overview, daily status, image preview, current image, and record operation language.
- Updated local comments and error logging to describe interaction status instead of kowtow-specific status plumbing.
- Removed the shared panel shadow from the kowtow page while preserving white panels, borders, status chips, and the blue rail.
- Confirmed the touched page no longer contains the old stiff labels or panel `box-shadow`.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final visual acceptance if the tool window is available.

## Decisions and Assumptions

- Keep all numbers backed by the existing stats API or local queue only.
- Use operation/status language that describes the actual interaction instead of inventing system capability.

## Files Touched

- apps/miniapp-taro/src/pages/kowtow/index.tsx
- apps/miniapp-taro/src/pages/kowtow/index.scss

## Verification Evidence

- `rg -n "交互服务|节点预览|博哥资源|本地提交|运行中|需同步|同步磕头状态|磕头状态|box-shadow" apps/miniapp-taro/src/pages/kowtow/index.tsx apps/miniapp-taro/src/pages/kowtow/index.scss`: no matches.
- `pnpm exec prettier --write apps/miniapp-taro/src/pages/kowtow/index.tsx apps/miniapp-taro/src/pages/kowtow/index.scss .agents/tasks/active/2026-06-18-miniapp-kowtow-operation-chrome-refine.md`: passed.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist stale-data and Node punycode warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no docs update needed because this was source-only presentation/copy polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-operation-chrome-refine.md`
