# Task Record: miniapp approval queue console

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve upload history hooks, pending/approved tabs, pull refresh, infinite scroll, image preview, UGC kill switch, and API behavior.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Docs Sync: Update design memory only if a durable rule changes; otherwise record why docs are unaffected.
- Safety: Do not change production API targets, backend behavior, database state, or runtime config semantics.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Inspected the approval page, tab head, and SCSS.
- Chose approval queue summary because it is a natural product-console queue surface and currently exposes loaded item count in a way that can be mistaken for a lazy-loaded total.
- Removed the `可见项` summary row and replaced it with an explicit pagination state row.
- Added a compact queue operation row for refreshing the active queue, and exposed a small retry affordance in the error empty state.

## Iteration Log

- Screen job: let the user inspect pending/approved upload history and recover from queue loading states.
- First state/action: current queue state, real queue totals, refresh path, and list status should be visible.
- Data source: tab badges and summary totals remain from upload history state totals/errors/loading; no counts are derived as category totals from currently loaded items.
- Removal target: the `可见项` summary row that could read like a total while pagination is still loading.
- Tencent Cloud pattern: compact queue summary table with an explicit operation row.

## Deferred Verification

- WeChat DevTools / real-device screenshot remains required for final broad visual acceptance when available.

## Decisions and Assumptions

- Keep the tab badge totals because they use hook `total`, not rendered item length.
- Add an explicit refresh operation row instead of new decorative art; this improves interaction clarity without inventing system behavior.

## Files Touched

- apps/miniapp-taro/src/pages/approve/index.tsx
- apps/miniapp-taro/src/pages/approve/index.scss

## Verification Evidence

- `git diff --check`: passed.
- Focused anti-slop scan: only matched the known unrelated backend `@MaxLength(48)` validation line.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; existing Browserslist stale-data and punycode warnings remain.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because this source-only visual/interaction hierarchy change does not alter miniapp conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-approval-queue-console.md`
