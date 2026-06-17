# Task Record: Bo Dedup Adjacent Review

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Continue candidate review with stricter deduplication and smaller batches after the noisy B review.

## Acceptance Boundaries

- Functional: Produce a read-only 60-80 photo review batch that excludes prior reviewed items, user negatives, and near-duplicate clusters.
- Verification: Confirm candidate count and provide manifest/sheet paths.
- Docs Sync: No repo behavior changes expected; run the agent harness before finishing.
- Safety: Do not modify Synology, production data, or import candidates before user confirmation.
- Archive: Move this record to `.agents/tasks/archive/` when complete or blocked.

## Actions

- Created task record.
- Generated an 80-item candidate set after excluding 400 previously reviewed items and 102 user-negative hashes.
- Applied per-anchor caps, per-folder caps, and thumbnail hash deduplication before rendering sheets.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- User negatives from the B batch should be treated as reliable.
- Future review batches should be smaller and visually deduplicated.

## Files Touched

- `.agents/tasks/active/20260530-233742-bo-dedup-adjacent-review.md`

## Verification Evidence

- `/tmp/bo-dedup-adjacent-review-80/manifest.tsv`: 80 candidate rows.
- `/tmp/bo-dedup-adjacent-review-80/thumbs`: 80 rendered thumbnails.
- `/tmp/bo-dedup-adjacent-review-80/dedup-page-1.jpg` and `dedup-page-2.jpg`: review sheets generated.
- `/tmp/bo-dedup-adjacent-review-80/summary.json`: selected from a pool of 1334 after excluding previous reviews and negative hash matches.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-233742-bo-dedup-adjacent-review.md`
