# Task Record: miniapp kowtow stats summary

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Replace the kowtow four-cell stats grid with a primary total summary plus compact metadata rows while preserving all source values and sync behavior.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change kowtow API behavior, sync interval, production API source targets, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed routing, conventions, quality, and current kowtow stats markup/styles.
- Replaced the four-cell `kowtow-stats` grid with `kowtow-stat-primary` and compact `kowtow-stat-row` metadata rows.
- Preserved cumulative total, today participant count, local queue state, and sync interval expressions.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification.

## Decisions and Assumptions

- Screen job: kowtow page shows current interaction totals and lets the user append a local interaction record.
- Primary state: cumulative record count, including unsynced local queue when present.
- Source of truth: existing `kowtowStats`, `kowtowCount`, and `KOWTOW_SYNC_INTERVAL_MS`.
- Removal target: four equally weighted stat cells make real operational data look like a dashboard mockup.
- Closest Tencent Cloud pattern: resource summary with one prominent value and compact property rows.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-kowtow-stats-summary.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across kowtow, retirement, shared photo browser, and custom tab bar source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-kowtow-stats-summary.md`
