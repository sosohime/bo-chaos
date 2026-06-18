# Task Record: miniapp tabbar icons

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by fixing bottom tab icon consistency.

## Acceptance Boundaries

- Functional: Regenerate miniapp tab bar icons as consistent 96x96 transparent assets with restrained inactive and active colors, including hidden/dynamic `tease` assets.
- Verification: Inspect generated asset metadata, create a local montage for visual review, run the miniapp WeChat build against `yuanbo.online`, run `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` and visual skill cover the rule or update them if the work creates a new durable convention.
- Safety: Do not change tab routes, runtime config, production API target, secrets, or UGC visibility behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Scanned tab bar implementation and image metadata.
- Found `tease` tab icon assets at 200x200 with a black block, while other tab icons are 96x96.
- Regenerated all tab bar inactive/active PNG assets as 96x96 transparent RGBA icons with a consistent line weight, inactive gray-blue, and active Tencent-blue.
- Generated `/tmp/bo-chaos-visual/tabbar-icons.png` as a local montage to inspect inactive/active pairs.
- Preserved tab routes, labels, runtime config visibility, and custom tab bar interaction.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn will include asset montage and build verification.

## Decisions and Assumptions

- Screen job: bottom navigation should remain stable and product-like across dynamic tab visibility.
- Primary state: selected tab should be clear through color and the existing top indicator, not a floating pill or oversized graphic.
- Source of truth: tab labels and visibility remain driven by app config/runtime config.
- Removal target: mismatched tab icon raster dimensions and heavy/placeholder-looking icon weight.
- Closest Tencent Cloud pattern: compact console navigation with restrained line icons and stable inactive state.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-tabbar-icons.md`
- `apps/miniapp-taro/src/images/tab-bar/history-active.png`
- `apps/miniapp-taro/src/images/tab-bar/history.png`
- `apps/miniapp-taro/src/images/tab-bar/kowtow-active.png`
- `apps/miniapp-taro/src/images/tab-bar/kowtow.png`
- `apps/miniapp-taro/src/images/tab-bar/my-active.png`
- `apps/miniapp-taro/src/images/tab-bar/my.png`
- `apps/miniapp-taro/src/images/tab-bar/retire-active.png`
- `apps/miniapp-taro/src/images/tab-bar/retire.png`
- `apps/miniapp-taro/src/images/tab-bar/tease-active.png`
- `apps/miniapp-taro/src/images/tab-bar/tease.png`
- `apps/miniapp-taro/src/images/tab-bar/travel-active.png`
- `apps/miniapp-taro/src/images/tab-bar/travel.png`

## Verification Evidence

- `file apps/miniapp-taro/src/images/tab-bar/*.png`: all tab bar assets are 96x96 PNG RGBA.
- Local montage visual check: `/tmp/bo-chaos-visual/tabbar-icons.png` shows consistent inactive/active icon pairs and no `tease` black block.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro emitted existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Tab bar anti-slop scan for fake AI/marketing copy, hard-coded retirement labels, stale image/load copy, old color tokens, and forbidden glow/gradient terms: no matches.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers tab icon rhythm and no new convention was introduced.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-icons.md`
