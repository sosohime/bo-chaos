# Task Record: miniapp photo list state console

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve photo pagination, lazy image loading, retry callbacks, existing copy sources, and all API behavior.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Docs Sync: Update design memory only if a durable rule changes; otherwise record why docs are unaffected.
- Safety: Do not change production API targets, runtime config semantics, backend behavior, or database state.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Inspected the shared photo list empty/loading/error component and its consumers.
- Chose the shared state panel because it appears across image-heavy pages and strongly affects the perceived product quality of loading and recovery moments.
- Refactored `PhotoListState` into a compact resource-state panel with a left status rail, tone badge, resource glyph, next-step row, and retry affordance.
- Kept existing caller copy, retry callbacks, pagination behavior, and lazy image behavior unchanged.

## Iteration Log

- Screen job: communicate list resource state and recovery path while photo data is loading, empty, or failed.
- First state/action: users should immediately understand whether the list is loading, empty, or retryable.
- Data source: all status text remains derived from existing component props and tone; no counts or metrics are introduced.
- Removal target: generic prompt-card feel in the current empty/loading/error layout.
- Tencent Cloud pattern: compact resource state panel with a left status marker, operation badge, and precise action affordance.

## Deferred Verification

- WeChat DevTools / real-device screenshot remains required for final broad visual acceptance when available.

## Decisions and Assumptions

- Keep state labels generic and operational; avoid invented diagnostics or AI claims.
- Do not use generated bitmap slices here because a native status primitive better fits a functional list state.

## Files Touched

- apps/miniapp-taro/src/features/photos/PhotoListState.tsx
- apps/miniapp-taro/src/features/photos/photo-browser.scss

## Verification Evidence

- `git diff --check`: passed.
- Focused anti-slop scan: only matched the known unrelated backend `@MaxLength(48)` validation line.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; existing Browserslist stale-data and punycode warnings remain.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because this source-only visual component change does not alter miniapp conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-state-console.md`
