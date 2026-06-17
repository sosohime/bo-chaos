# Task Record: Bo candidate batches

- State: handoff
- Mode: full
- Started: 2026-05-30
- Branch: current dirty worktree
- Request: Continue beyond the first five imported Bo photos by producing safe confirmation batches from Supersosoplus sources.

## Acceptance Boundaries

- Functional: find and present additional Bo candidates in numbered contact sheets without writing production until user confirms exact IDs.
- Verification: generated sheets must map every displayed ID to a source path and avoid re-importing already selected files.
- Docs Sync: no app behavior or docs changes expected; run `pnpm agent:lint` before finishing non-trivial work.
- Safety: no broad directory import; no production writes in candidate-generation phase.
- Archive: archive after candidate sheets are handed off or imported in a confirmed later batch.

## Actions

- Started a second-stage candidate search after the first five-photo import.
- Generated fast numbered contact sheets under `/tmp/bo-candidate-batches-fast`:
  - `C`: `/Volumes/home/Photos/chaos`, 76 mapped candidates after skipping confirmed seed paths where possible.
  - `P`: `/Volumes/home/Photos/p`, 33 mapped candidates.
  - `R`: loose files in `/Volumes/home/Photos`, 60 mapped candidates.
  - `W`: recent files in `/Volumes/home/WeChatBackup/XQ-EC72/Pictures`, 80 mapped candidates.
- Stopped the slower hash-based scanner and used lightweight path-based sheets to keep review moving.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- Production URL/database checks are deferred until a user-confirmed import batch.

## Decisions and Assumptions

- The confirmed Bo seed IDs are `036`, `047`, `058`, `059`, and `078` from `/Volumes/home/Photos/chaos`.
- Use numbered contact sheets as the confirmation mechanism.
- The fast sheets may contain duplicates already imported or seen elsewhere; de-dupe again before any confirmed import.

## Files Touched

- `.agents/tasks/active/20260530-204218-bo-candidate-batches.md`

## Verification Evidence

- Generated pages: `/tmp/bo-candidate-batches-fast/c-page-1.jpg`, `c-page-2.jpg`, `p-page-1.jpg`, `r-page-1.jpg`, `r-page-2.jpg`, `w-page-1.jpg`, `w-page-2.jpg`.
- Generated manifests: `/tmp/bo-candidate-batches-fast/{c,p,r,w}-manifest.tsv`.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: handoff
- Archive path: `.agents/tasks/archive/20260530-204218-bo-candidate-batches.md`
