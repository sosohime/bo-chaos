# Task Record: miniapp tabbar console indicator

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app UI toward Tencent Cloud-style product-console surfaces with restrained AI/tech feeling.

## Acceptance Boundaries

- Functional: Preserve tab routes, active tab detection, runtime tab visibility, and UGC tab hiding behavior.
- Visual: Make bottom tab active/inactive states feel like stable product-console navigation instead of a rounded button/pill treatment.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if this introduces a durable rule beyond `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Audited custom tab bar TSX, SCSS, and tab icon assets.
- Identified the active icon shell's pale rounded background as a remaining pill-like treatment that weakens the console navigation feel.
- Reworked tab selected state from rounded icon backing to a precise top indicator while preserving stable control dimensions.
- Kept inactive and active icon assets, route selection, and runtime tab filtering unchanged.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: provide stable global navigation across the mini app.
- Primary state: the selected tab should be obvious without resizing, floating, or adding a rounded badge.
- Source of truth: current route plus runtime tab visibility config.
- Removal target: active tab's rounded icon-shell fill/border.
- Closest Tencent Cloud pattern: compact product navigation with a precise active rule.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-tabbar-console-indicator.md`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode deprecation warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed for miniapp touched area; the only remaining matched `48` is unrelated backend `@MaxLength(48)`.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning. No `docs/agent/CONVENTIONS.md` update needed because `apps/miniapp-taro/DESIGN.md` already covers stable tab active/inactive states and avoiding floating pill treatments.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-console-indicator.md`
