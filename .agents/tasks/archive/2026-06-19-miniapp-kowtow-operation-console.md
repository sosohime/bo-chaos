# Task Record: miniapp kowtow operation console

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve kowtow local queue behavior, two-second sync interval, batch submit API calls, share config, review-mode branch, canvas feedback, and image swiper behavior.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Docs Sync: Update design memory only if a durable rule changes; otherwise record why docs are unaffected.
- Safety: Do not change production API targets, backend behavior, database state, or runtime config semantics.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Inspected the kowtow page TSX/SCSS, API wrapper, swiper component, and existing design memory.
- Chose the kowtow first viewport because it combines stats, queued writes, sync status, primary action, and media in a high-frequency screen.
- Moved the write action into the primary resource summary so queue state, sync state, and the command are read as one console operation.
- Added a compact command row and tightened the action block surface without changing local queue, sync, batch submit, canvas, or swiper behavior.

## Iteration Log

- Screen job: let the user see current interaction state and write one local interaction record.
- First state/action: sync status, local queue state, and the write action should be visible before the media resource section.
- Data source: all numbers and status labels remain from API stats, local queue state, shared sync interval constant, or current swiper index.
- Removal target: split statistics/action layout that makes the main operation feel like a footer instead of a resource action.
- Tencent Cloud pattern: compact resource summary table with an integrated command row.

## Deferred Verification

- WeChat DevTools / real-device screenshot remains required for final broad visual acceptance when available.

## Decisions and Assumptions

- Do not add image slices here because the screen already has real media content; the improvement should come from operational hierarchy.
- Keep the existing "磕袁" product language where it is a tab/page identity, but make action copy concrete and queue-based.

## Files Touched

- apps/miniapp-taro/src/pages/kowtow/index.tsx
- apps/miniapp-taro/src/pages/kowtow/index.scss

## Verification Evidence

- `git diff --check`: passed.
- Focused anti-slop scan: only matched the known unrelated backend `@MaxLength(48)` validation line.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; existing Browserslist stale-data and punycode warnings remain.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because this source-only visual/interaction hierarchy change does not alter miniapp conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-kowtow-operation-console.md`
