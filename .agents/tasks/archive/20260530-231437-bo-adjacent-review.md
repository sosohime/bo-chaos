# Task Record: Bo Adjacent Photo Review

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Generate a cautious 200-photo review batch from files adjacent to confirmed Bo photos, accounting for backs and side profiles in continuous sequences.

## Acceptance Boundaries

- Functional: Produce a read-only review sheet of likely adjacent candidates without modifying Synology, production data, or local imports.
- Verification: Confirm the candidate count and provide manifest/sheet paths.
- Docs Sync: No repo behavior changes expected; run the agent harness before finishing.
- Safety: Do not delete files, change person classifications, or import candidates before user confirmation.
- Archive: Move this record to `.agents/tasks/archive/` when complete or blocked.

## Actions

- Created task record for the adjacent review operation.
- Built a 200-item candidate set from neighbor files around confirmed Bo anchors, excluding already confirmed items and known false positives.
- Generated five 40-item review sheets with distance markers (`d1` means one file away from a confirmed Bo anchor).

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- Use neighbor photos from folders that already contain confirmed Bo items, because continuous sequences can include backs and side profiles missed by face recognition.

## Files Touched

- `.agents/tasks/active/20260530-231437-bo-adjacent-review.md`

## Verification Evidence

- `/tmp/bo-adjacent-review-200/manifest.tsv`: 200 candidate rows.
- `/tmp/bo-adjacent-review-200/thumbs`: 200 rendered thumbnails.
- `/tmp/bo-adjacent-review-200/adjacent-page-1.jpg` through `adjacent-page-5.jpg`: review sheets generated.
- `/tmp/bo-adjacent-review-200/folder-summary.json`: source folder summary generated.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-231437-bo-adjacent-review.md`
