# Task Record: miniapp upload next command

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve UGC kill switch, category selection, image selection, upload queue concurrency, upload progress, retry behavior, upload history refresh, and API behavior.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Docs Sync: Update design memory only if a durable rule changes; otherwise record why docs are unaffected.
- Safety: Do not change production API targets, backend behavior, database state, or runtime config semantics.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Inspected the personal center upload flow and styles.
- Chose the upload task summary because the primary next action was lower in the form while the first summary panel was mostly read-only.
- Added a compact next-command row to the upload task summary, with direct actions only for adding images or submitting review when the state is actually executable.
- Tightened category readiness so creating a new category only counts as ready after a non-empty category name is entered.

## Iteration Log

- Screen job: configure and submit a recoverable upload queue.
- First state/action: current stage and the next useful action should be visible in the task summary.
- Data source: stage, queue counts, and action labels come from selected system/category/images, upload summary, local upload status, and shared constants.
- Removal target: read-only summary without an operational command line.
- Tencent Cloud pattern: task summary table with a compact command row.

## Deferred Verification

- WeChat DevTools / real-device screenshot remains required for final broad visual acceptance when available.

## Decisions and Assumptions

- The command row only runs actions that can be executed directly from code: add images or submit. It does not fake opening native picker controls for system/category selection.
- Existing lower form buttons are kept for explicit local controls; the summary command improves first-screen operation clarity.

## Files Touched

- apps/miniapp-taro/src/pages/my/index.tsx
- apps/miniapp-taro/src/pages/my/index.scss

## Verification Evidence

- `git diff --check`: passed.
- Focused anti-slop scan: only matched the known unrelated backend `@MaxLength(48)` validation line.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; existing Browserslist stale-data and punycode warnings remain.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because this source-only visual/interaction hierarchy change does not alter miniapp conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-upload-next-command.md`
