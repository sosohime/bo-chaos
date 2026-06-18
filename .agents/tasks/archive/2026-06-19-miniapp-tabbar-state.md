# Task Record: miniapp tabbar state

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Refine custom tab bar active/inactive state styling while preserving runtime tab visibility, UGC tab hiding, icon paths, and navigation behavior.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change page routes, runtime config semantics, production API target, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed tab bar code and generated a local icon contact sheet to inspect current icon assets.
- Identified the active tab state as too dependent on a short top indicator rather than a stable icon/label state.
- Added a fixed icon shell for inactive and active tabs so the selected state is visible without changing layout size.
- Kept active label font weight stable to prevent tap-state rhythm shifts.
- Preserved runtime tab visibility, UGC-driven history/travel hiding, icon paths, and `Taro.switchTab` navigation.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification unless DevTools becomes available.

## Decisions and Assumptions

- Screen job: provide stable primary navigation across retirement, interaction, album, travel, and account surfaces.
- Primary state: active tab must be obvious without resizing or becoming a floating campaign pill.
- Source of truth: current route, app context selected tab, runtime tab labels/visibility, and UGC kill switch.
- Removal target: over-reliance on the short `tab-bar-indicator`.
- Closest Tencent Cloud pattern: quiet selected resource tab with fixed icon shell and precise blue state.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-tabbar-state.md`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across My, approval, kowtow, retirement, history, travel, tease, shared photo browser, custom tab bar, and photo item source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.
- Local icon contact sheet generated at `/tmp/bo-chaos-tab-icons.png` for inspection only; it was not added to the repo.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-state.md`
