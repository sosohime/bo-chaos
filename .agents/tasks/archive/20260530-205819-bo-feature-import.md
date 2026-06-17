# Task Record: Bo feature import

- State: complete
- Mode: full
- Started: 2026-05-30
- Branch: current dirty worktree
- Request: Import the user-confirmed candidate IDs and extract reusable Bo image features to reduce manual review.

## Acceptance Boundaries

- Functional: parse confirmed IDs and ranges, de-duplicate selected files, import them as `reviewing`, and generate a local feature ranking for additional candidates.
- Verification: verify parsed IDs, imported counts, public URL responses, database category counts, and feature-ranking output.
- Docs Sync: no repo behavior changes expected; run `pnpm agent:lint`.
- Safety: do not import unconfirmed auto-ranked images; use local-only feature extraction.
- Archive: archive after import and feature output are complete or blocked.

## Actions

- Started parsing the user's confirmed ID list.
- Parsed 75 requested IDs/ranges with no missing IDs.
- De-duplicated the selection to 46 unique file hashes.
- Extracted local Apple Vision FeaturePrint distances for the 46 positive samples against the current candidate manifests.
- Staged the 46 unique images as normalized JPG files under `/tmp/bo-confirmed-import/staging/bofans/photo`.
- Uploaded `/tmp/bo-confirmed-import/bo-confirmed-import.tgz` to the primary server and extracted it into `/usr/soso/local-oss-rs/storage`.
- Inserted 43 new `Photo` rows into `博史 / 群晖导入`; 3 selected rows already existed from the first import batch.
- Generated auto-ranked suggestion output at `/tmp/bo-auto-high-confidence/auto-top.jpg`.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- None.

## Decisions and Assumptions

- Existing category remains `system=history`, `name=博史`, `secondCategory=群晖导入`.
- Auto-ranked candidates are suggestions only until the user approves a threshold or batch.
- The first auto-ranked sheet is useful for prioritization but not yet accurate enough for blind import; it contains plausible group/life images and false positives.

## Files Touched

- `.agents/tasks/active/20260530-205819-bo-feature-import.md`

## Verification Evidence

- `/tmp/bo-confirmed-selected.json`: requested `75`, missing `0`, deduped selected `46`.
- `/tmp/bo-feature-rank-current.tsv`: Apple Vision FeaturePrint generated with `46` positives.
- `ssh bo-chaos-1 ... Prisma`: created `43`, existing `3`, category id `26`, reviewing count `48`.
- `curl --resolve yuanbo.online:443:101.34.252.219 <manifest URLs>`: all `46` selected manifest URLs returned `200`.
- `ssh bo-chaos-1 'systemctl is-active local-oss-rs && pm2 ls --no-color'`: `local-oss-rs` active; backend `main` and admin `nextjs-app` online.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-205819-bo-feature-import.md`
