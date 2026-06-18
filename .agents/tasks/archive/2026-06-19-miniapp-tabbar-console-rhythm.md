# Task Record: Miniapp tabbar console rhythm

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud console product surface with credible technical restraint.

## Acceptance Boundaries

- Functional: Custom tab bar routing, runtime tab visibility, active tab detection, and UGC hiding remain unchanged. Styling should make active/inactive states stable and less legacy segmented.
- Verification: Run production-base mini app build, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Agent docs updated only if conventions change; otherwise record why docs are unaffected.
- Safety: No production writes, no API target changes, no secrets, no backend/data behavior changes.
- Archive: Move this record to `.agents/tasks/archive/` after checks pass.

## Actions

- Read mini app, visual design, doc sync, routing, conventions, quality, and workflow guidance.
- Inspected the custom tab bar TSX/SCSS and app tabBar config.
- Design diagnosis: the tab bar is a persistent navigation surface. The highest-value state is which route is selected. The old segmented dividers and bottom indicator can read like a legacy control strip rather than a product-console nav. The closest Tencent Cloud pattern is a quiet white navigation rail with a precise selected line.
- Removed visible vertical dividers so the tab bar no longer reads as a segmented legacy control.
- Moved the active indicator to a top short rule where it is not confused with the safe-area bottom edge.
- Tightened icon sizing and inactive opacity while keeping hit area and routing unchanged.

## Iteration Log

- Not using visual-fast-lane; this turn includes source changes plus final build/lint.

## Deferred Verification

- WeChat DevTools and real-device visual screenshots remain required for final broad UI acceptance but are not available in this local CLI pass.

## Decisions and Assumptions

- Keep icon assets and runtime visibility logic unchanged.
- Move selection emphasis to a top short rule and quiet the inactive icon/text treatment.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-tabbar-console-rhythm.md`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`

## Verification Evidence

- `git diff --check`: passed.
- Touched-file anti-slop scan for fake intelligence copy, marketing words, glow/gradient/shadow, hard-coded retirement numbers, old animation prompt copy, loaded-count labels, and old border tokens: passed with no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist data age warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this is source-only tab bar styling within existing mini app visual rules.
- WeChat DevTools / real-device screenshots: not run in this local CLI pass; still needed for final broad UI acceptance.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-console-rhythm.md`
