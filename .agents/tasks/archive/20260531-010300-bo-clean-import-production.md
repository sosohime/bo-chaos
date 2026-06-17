# Task Record: Bo Clean Import Production

- State: active
- Mode: full
- Started: 2026-05-31
- Branch: main
- Request: Upload preview-approved clean Bo import package to production storage and import reviewing Photo rows.

## Acceptance Boundaries

- Functional: Upload the preview-approved package, expose the 488 image files from production static storage, and insert 488 reviewing Photo rows.
- Verification: Check package checksum, remote file count, public URL samples, DB category/status counts, and PM2 status.
- Docs Sync: No repo behavior changes expected; run agent harness before finishing.
- Safety: Only insert the approved reviewing import set; do not publish or approve photos.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Uploaded `/tmp/bo-clean-import.tgz` to `101.34.252.219:/tmp/bo-clean-import.tgz`.
- Verified remote SHA-256 matches local package checksum.
- Extracted images into `/usr/soso/local-oss-rs/storage/bofans/photo/synology-bo`.
- Removed macOS AppleDouble sidecar files and root-level package artifacts from static storage.
- Fixed static file ownership and permissions.
- Executed `/usr/soso/local-oss-rs/storage/import.sql` once against the production database after adapting the Prisma URL for `psql`.

## Iteration Log

- Initial tar extraction produced 488 image files plus 488 `._*` AppleDouble files; cleaned the sidecars and verified the final file count is 488.
- Initial `psql` attempt failed before executing SQL because Prisma's `?schema=...` query parameter is not accepted by `psql`; stripped the query parameter for the CLI command only.

## Deferred Verification

- Admin UI visual confirmation is deferred to the user session, but database and public URL checks passed.

## Decisions and Assumptions

- Keep imported photos in `reviewing`; existing admin review workflow will handle publishing.
- Keep the generated package at `/tmp/bo-clean-import.tgz` on the server for short-term rollback/audit convenience.

## Files Touched

- `.agents/tasks/active/20260531-010300-bo-clean-import-production.md`
- `/tmp/bo-clean-import.tgz` on the production server
- `/usr/soso/local-oss-rs/storage/bofans/photo/synology-bo/*` on the production server
- Production database `Category` and `Photo` rows for the approved import set

## Verification Evidence

- Remote package checksum: `9097002c07d0dd161cb1127e1a4081af9375c77584a11d638fa8230957ff5a53`.
- Static file count: 488 files, 0 AppleDouble sidecars.
- Public URL samples: first, middle, GIF, and final image returned HTTP 200.
- Database import: `before_synology=0`, `after_synology=488`, `after_reviewing=488`.
- Category count: `id=29`, `system=history`, `name=history`, `secondCategory=群晖导入`, linked import photos `488`.
- PM2 status: `main` cluster workers online and `nextjs-app` online.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260531-010300-bo-clean-import-production.md`
