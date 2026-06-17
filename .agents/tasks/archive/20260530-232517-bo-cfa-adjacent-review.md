# Task Record: Bo CFA Adjacent Review

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Continue cautious Bo candidate review using time-sequenced CFA folders instead of noisy UUID-neighbor scanning.

## Acceptance Boundaries

- Functional: Produce a read-only 200-photo review sheet from adjacent files in time-sequenced CFA folders.
- Verification: Confirm candidate count and provide manifest/sheet paths.
- Docs Sync: No repo behavior changes expected; run the agent harness before finishing.
- Safety: Do not modify Synology, production data, or import candidates before user confirmation.
- Archive: Move this record to `.agents/tasks/archive/` when complete or blocked.

## Actions

- Created task record.
- Generated a 200-item candidate set from CFA folders with confirmed Bo anchors, excluding the previous noisy adjacent review batch.
- Rendered five 40-item review sheets with `B###` labels and distance markers.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- Exclude `/p/gu6s图片` from neighbor scans because UUID filename order is not meaningful.
- Prefer CFA folders with confirmed Bo anchors and sort by capture time/filename to find continuous frames.

## Files Touched

- `.agents/tasks/active/20260530-232517-bo-cfa-adjacent-review.md`

## Verification Evidence

- `/tmp/bo-cfa-adjacent-review-200/manifest.tsv`: 200 candidate rows.
- `/tmp/bo-cfa-adjacent-review-200/thumbs`: 200 rendered thumbnails.
- `/tmp/bo-cfa-adjacent-review-200/cfa-adjacent-page-1.jpg` through `cfa-adjacent-page-5.jpg`: review sheets generated.
- Source folders: `/CFA/2025-03-23`, `/CFA/2025-03-22`, `/CFA/2025-03-18`, `/CFA/2026-01-02`, `/CFA/2023-03-25`.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-232517-bo-cfa-adjacent-review.md`
