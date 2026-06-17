# Task Record: Synology Bo Person Correction

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Remove false positive S009-S054 items from the Synology Photos `博` person grouping without deleting original files.

## Acceptance Boundaries

- Functional: Correct only the Synology Photos person classification for the specified S009-S054 range.
- Verification: Confirm the target range maps to 46 items, apply a non-destructive person-association removal, and verify the person grouping count changes as expected.
- Docs Sync: No repo behavior changes expected; run the agent harness before finishing.
- Safety: Do not delete photos or modify Bo production data; do not record secrets or session tokens.
- Archive: Move this record to `.agents/tasks/archive/` when complete or blocked.

## Actions

- Created task record for the Synology correction operation.
- Inspected Synology Photos frontend bundle and identified the non-destructive `SYNO.Foto.Browse.Person.deleteFace` API used by the UI.
- Mapped S009-S054 to 46 Synology item IDs and 49 `person_id=6` face IDs.
- Removed the 49 face associations from the `博` person grouping in batches without deleting source photos.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- User explicitly confirmed S009-S054 are not Bo and other shown Synology items are acceptable.
- The correction should remove those items from the `博` person album, not delete files from the NAS.

## Files Touched

- `.agents/tasks/active/20260530-221215-synology-person-correction.md`

## Verification Evidence

- `/tmp/syno-bo-remove-s009-s054-faces.tsv`: mapped 46 target items to 49 `博` face IDs, with no missing target item.
- Synology Photos person count: `博` changed from 531 to 485.
- Post-check: S009-S054 target items have 0 remaining `person_id=6` faces.
- Post-check: current `博` person item list has 485 items and 0 overlap with S009-S054 target item IDs.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-221215-synology-person-correction.md`
