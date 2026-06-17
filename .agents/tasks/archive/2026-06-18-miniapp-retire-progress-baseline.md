# Task Record: miniapp retire progress baseline

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: main
- Request: Fix the mini app retirement countdown progress bar so it is not arbitrary.

## Acceptance Boundaries

- Functional: Retirement progress must use a visible, explainable baseline instead of a hidden arbitrary start date.
- Verification: Build the WeChat mini app and run agent lint.
- Docs Sync: Record the progress baseline and verification evidence.
- Safety: Local mini app UI change only; no production writes.
- Archive: Archive this task record after verification.

## Actions

- Replaced the arbitrary `2025-01-01` progress baseline with a visible observation cycle from `2024-07-06` to `2028-07-06`.
- Added remaining percentage, visible start/end dates, and observed-day count under the progress bar.
- Updated copy/share text to state the observation cycle, making the progress percentage auditable.

## Iteration Log

- User flagged that the progress bar was arbitrary.
- Confirmed the hidden start date was indeed a poor baseline.
- Chose a four-year observation cycle ending on the existing shared retirement target date.

## Deferred Verification

- None.

## Decisions and Assumptions

- The mini app should present progress as an observation cycle, not an unknown career/life progress estimate.
- If a canonical start date is later provided, only `BO_RETIRE_START` needs to change.

## Files Touched

- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-retire-progress-baseline.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: compiled successfully.
- Local date sanity check for `2024-07-06 -> 2028-07-06`: progress is about `48.74%` on 2026-06-18.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-progress-baseline.md`
