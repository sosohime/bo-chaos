# Task Record: Synology S001 Person Correction

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Remove current preview S001 from the Synology Photos `博` person grouping without deleting the original file.

## Acceptance Boundaries

- Functional: Correct only the current S001 false positive in the Synology Photos person classification.
- Verification: Confirm S001 item mapping, remove only `person_id=6` face associations, and verify it no longer appears in the `博` person list.
- Docs Sync: No repo behavior changes expected; run the agent harness before finishing.
- Safety: Do not delete photos or modify Bo production data; do not record secrets or session tokens.
- Archive: Move this record to `.agents/tasks/archive/` when complete or blocked.

## Actions

- Created task record for the S001 correction operation.
- Mapped current preview S001 to Synology item `32696`.
- Removed one `person_id=6` face association from the `博` person grouping without deleting the source photo.
- Regenerated the first 120 preview sheets after S001 removal.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- Interpreted the user's `S001部队` as `S001不对`.

## Files Touched

- `.agents/tasks/active/20260530-222947-synology-s001-correction.md`

## Verification Evidence

- `/tmp/syno-bo-s001-delete-result.json`: deleted face id `9288` for item `32696`.
- Synology Photos person count: `博` changed from 485 to 484.
- Post-check: S001 item has 0 remaining `person_id=6` faces.
- Post-check: S001 item is not present in the current `博` person item list.
- `/tmp/syno-bo-person-preview-after-s001`: regenerated preview sheets and manifest.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-222947-synology-s001-correction.md`
