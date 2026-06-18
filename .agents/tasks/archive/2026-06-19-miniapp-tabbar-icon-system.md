# Task Record: miniapp tab bar icon system

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve the custom tab bar routing, runtime tab labels, visibility config, and UGC kill switch behavior.
- Verification: Build the WeChat mini app, run whitespace/style scans, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Docs Sync: Update design memory only if a new durable rule is introduced; otherwise record why source-only visual resource work does not need L2 doc changes.
- Safety: Do not touch production API targets, secrets, backend behavior, or database state.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Diagnosed the global mini app visual surface after the previous page-level console refactors.
- Chose the bottom tab icon set as the next public visual system target because it appears on every first viewport and currently depends on inconsistent legacy PNG assets.
- Replaced all tab bar PNG assets, including the currently hidden `tease` pair, with a unified 96x96 line-icon system.
- Kept tab filenames, component logic, tab labels, active state behavior, runtime config, and UGC visibility behavior unchanged.

## Iteration Log

- Screen job: provide stable global navigation with a clear current section.
- First state/action: active tab must be obvious without becoming a marketing pill or changing layout rhythm.
- Data source: labels and visibility continue to come from runtime miniapp config and the UGC kill switch; icons contain no counts or inferred state.
- Removal target: legacy inconsistent bitmap tab icons.
- Tencent Cloud pattern: compact console side/nav item translated to WeChat bottom tab, using precise blue active state and quiet gray-blue inactive state.

## Deferred Verification

- WeChat DevTools / real-device screenshot remains required for final broad visual acceptance when available.

## Decisions and Assumptions

- Replace only icon assets, keeping filenames, sizes, tab config, and component behavior unchanged to avoid runtime risk.
- Use restrained line icons with consistent stroke weight instead of decorative image slices; generated bitmap art is not needed for this functional navigation control.

## Files Touched

- apps/miniapp-taro/src/images/tab-bar/\*.png

## Verification Evidence

- `identify -format '%f %wx%h %[channels] %[fx:mean.a]\n' apps/miniapp-taro/src/images/tab-bar/*.png`: all tab icons are 96x96 sRGBA with nonzero alpha.
- Local icon contact sheet: `/tmp/bochaos-tabbar-icons.png` inspected for line weight, active/inactive color, and rhythm.
- `git diff --check`: passed.
- Focused anti-slop scan: only matched the known unrelated backend `@MaxLength(48)` validation line.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; existing Browserslist stale-data and punycode warnings remain.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because source assets changed without changing miniapp conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-icon-system.md`
