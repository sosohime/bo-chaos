# Task Record: Synology Bo import

- State: complete
- Mode: full
- Started: 2026-05-30
- Branch: current dirty worktree
- Request: Import a locally selected Bo photo directory from Supersosoplus into production as reviewing under category `群晖导入`.

## Acceptance Boundaries

- Functional: choose a conservative Bo-focused source directory, stage public photo files, upload them to the primary server OSS storage, and create `Photo` rows with status `reviewing`.
- Verification: verify staged counts, remote file visibility, public URL 200 responses, and database category/photo counts.
- Docs Sync: no schema/API/docs behavior changes expected; run `pnpm agent:lint`.
- Safety: avoid broad imports from ambiguous camera/WeChat backups; do not modify auth, schema, or existing photo rows.
- Archive: archive this record after import completion or handoff.

## Actions

- Mounted/read Supersosoplus photo sources already available at `/Volumes/home/Photos`.
- Selected `/Volumes/home/Photos/chaos` as the likely Bo project candidate for review, pending contact-sheet inspection.
- Generated contact sheets for `/Volumes/home/Photos/chaos` and `/Volumes/home/Photos/p`.
- User corrected that only a small subset of the displayed images are Bo images.
- Stopped and removed local staging before any upload or production database write.
- User confirmed `036`, `047`, `058`, `059`, and `078` are Bo images.
- Staged only those five images from `/Volumes/home/Photos/chaos`, normalized them to JPG with longest edge at 2560, and packaged them as `/tmp/bo-curated-import/bo-curated-import.tgz`.
- Uploaded the package to `bo-chaos-1` and extracted it into `/usr/soso/local-oss-rs/storage/bofans/photo`.
- Created category `system=history`, `name=博史`, `secondCategory=群晖导入` and inserted five `Photo` rows with status `reviewing`.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- None.

## Decisions and Assumptions

- User explicitly approved letting the agent choose a Bo curated directory.
- New imports should be created as `reviewing` under category secondCategory `群晖导入`.
- A conservative source directory is preferred over full phone/photo-library import to avoid unrelated production review noise.
- Do not import an entire directory based on directory name alone; import only an explicit curated file list after visual confirmation.
- Existing category model uses `system` for page grouping and `name + secondCategory` as the unique category key.
- The import category is `博史 / 群晖导入`, so approved photos will appear under the history system after review.

## Files Touched

- `.agents/tasks/active/20260530-202119-synology-bo-import.md`

## Verification Evidence

- `/tmp/bo-chaos-sheets/chaos-sheet.jpg`: showed mixed non-Bo content, unsuitable for full-directory import.
- `rm -rf /tmp/bo-synology-import`: local staging removed.
- `ssh bo-chaos-1 ...`: no `/tmp/bo-synology-import.tgz`; remote `photo_synology_*` file count is `0`.
- `/tmp/bo-curated-import/manifest.tsv`: staged five confirmed Bo images, total package size about 2.5 MB.
- `ssh bo-chaos-1 ... Prisma`: created category id `26` and photo ids `286`-`290`, all `reviewing`.
- `curl --resolve yuanbo.online:443:101.34.252.219 <photo URLs>`: all five imported URLs returned `200`.
- `ssh bo-chaos-1 'systemctl is-active local-oss-rs && pm2 ls --no-color'`: `local-oss-rs` active; backend `main` and admin `nextjs-app` online.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260530-202119-synology-bo-import.md`
