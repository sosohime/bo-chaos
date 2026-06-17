# Task Record: Bo Self-Filtered Review

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Fix the candidate review pipeline by applying face-result filtering and anchor-image similarity before asking for more manual review.

## Acceptance Boundaries

- Functional: Build a stricter read-only candidate filter that rejects obvious non-Bo faces and unrelated scenery before generating any new review sheet.
- Verification: Report filtering counts and only surface candidates that pass explicit face/similarity criteria.
- Docs Sync: No repo behavior changes expected; run the agent harness before finishing.
- Safety: Do not modify Synology, production data, or import candidates before user confirmation.
- Archive: Move this record to `.agents/tasks/archive/` when complete or blocked.

## Actions

- Created task record.
- Built and ran a stricter candidate filter over the remaining neighbor pool.
- Applied Synology face-association filtering: candidates with faces but no `person_id=6` were rejected.
- Applied anchor similarity filtering for no-face candidates, requiring close sequence distance, close timestamp, and thumbnail similarity.
- Compared the surviving candidates against their confirmed Bo anchors.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- User is correct that prior batches did not sufficiently filter unrelated faces and scenery.
- Use Synology face associations as a hard negative signal: faces present but no `person_id=6` means reject.
- Use visual similarity to a confirmed Bo anchor only for no-face side/back candidates.

## Files Touched

- `.agents/tasks/active/20260530-234209-bo-self-filtered-review.md`

## Verification Evidence

- `/tmp/bo-self-filtered-candidates/summary.json`: scanned 275 candidates from a pool of 361 and selected only 2.
- `/tmp/bo-self-filtered-candidates/manifest.tsv`: 2 surviving candidates.
- `/tmp/bo-self-filtered-candidates/candidate-anchor-pairs.jpg`: both surviving candidates are near-duplicate adjacent frames of already-confirmed anchors, not meaningfully new review material.
- Rejection rules included hard rejection of recognized non-Bo faces and rejection of no-face images that were not visually/time close to their Bo anchor.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-234209-bo-self-filtered-review.md`
