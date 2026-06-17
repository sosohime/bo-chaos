# Task Record: Bo Remaining Folders Review

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Finish checking the remaining folders beyond `/p`, CFA, and WeChat backup folders using strict self-filtering.

## Acceptance Boundaries

- Functional: Scan remaining folders that contain confirmed Bo anchors and only surface candidates that pass face/similarity filtering.
- Verification: Report scan/filter counts, selected candidates, and folder coverage.
- Docs Sync: No repo behavior changes expected; run the agent harness before finishing.
- Safety: Do not modify Synology, production data, or import candidates before user confirmation.
- Archive: Move this record to `.agents/tasks/archive/` when complete or blocked.

## Actions

- Created task record.
- Scanned remaining confirmed-anchor folders outside previously reviewed `/p`, CFA, and WeChat scopes with the strict self-filter script.
- Wrote operational output to `/tmp/bo-remaining-self-filtered/`.

## Iteration Log

- Remaining anchored folder scan covered 24 folders and built a 175-item neighbor candidate pool.
- Strict filters selected 0 candidates for user review/import.
- Rejected 104 no-face candidates because they were not close enough to confirmed Bo anchor frames.
- Rejected 34 candidates with detected faces that did not include Synology person `博`.

## Deferred Verification

- N/A

## Decisions and Assumptions

- Exclude `/p`, `/CFA`, and `/MobileBackup/.../WeiXin/...` because they were already handled separately.
- Use only folders with confirmed Bo anchors; unanchored folders cannot be safely mined without turning the task back into broad manual review.

## Files Touched

- `.agents/tasks/active/20260530-235627-bo-remaining-folders-review.md`

## Verification Evidence

- `/tmp/bo-remaining-self-filtered/summary.json`: `pool=175`, `selected=0`, `reject_counts.noface_reject=104`, `reject_counts.face_not_bo=34`.
- Excluded already-handled anchor counts: `/p` 181, CFA 203, WeChat 27.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/20260530-235627-bo-remaining-folders-review.md`
