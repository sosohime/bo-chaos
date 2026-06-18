# Task Record: miniapp retire information refine

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app retirement home toward a Tencent Cloud style product UI without fake system language.

## Acceptance Boundaries

- Functional: Preserve the canonical shared retirement constants, countdown behavior, clipboard action, and navigation to kowtow.
- Verification: Build the WeChat mini app, run agent lint, and check whitespace diffs.
- Docs Sync: No architecture or command docs expected for presentation/copy polish.
- Safety: No production writes, no API target changes, no secrets.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Diagnosed the retirement home as still using fake-ish console terms such as service/config status and a duplicated progress panel.
- Renamed the first section from a hero-style shell to an overview shell in markup and styles.
- Replaced inflated service/config labels with time baseline, node information, and explicit countdown states.
- Changed the lower panel from duplicated progress percentages to start node, target node, and current UTC+8 time.
- Removed subtle panel shadows from the retirement overview and details panel to keep the page closer to a Tencent Cloud console surface.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final visual acceptance if the tool window is available.

## Decisions and Assumptions

- Keep countdown facts traceable to shared constants and runtime time only.
- Remove inflated system copy rather than decorating it.

## Files Touched

- apps/miniapp-taro/src/pages/retire/index.tsx
- apps/miniapp-taro/src/pages/retire/index.scss

## Verification Evidence

- `rg -n "retire-hero|时间服务|服务状态|基准配置|进度参数|15年|十五年" apps/miniapp-taro/src/pages/retire apps/miniapp-taro/src -g '*.{tsx,scss}'`: no matches.
- `pnpm exec prettier --write apps/miniapp-taro/src/pages/retire/index.tsx apps/miniapp-taro/src/pages/retire/index.scss .agents/tasks/active/2026-06-18-miniapp-retire-information-refine.md`: passed.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist stale-data and Node punycode warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no docs update needed because this was source-only presentation/copy polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-information-refine.md`
