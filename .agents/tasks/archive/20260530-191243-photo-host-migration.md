# Task Record: migrate photo host off zhangyiming

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Move image hosting behavior away from expired `zhangyiming.online` and onto the primary server.

## Acceptance Boundaries

- Functional: New backend uploads use `https://yuanbo.online` for OSS upload and returned image URLs.
- Verification: Confirm backend service restart, public static paths, and database impact.
- Docs Sync: Run `pnpm agent:lint` before final handoff.
- Safety: Do not mutate historical production DB URLs without explicit approval.
- Archive: Move this record to `.agents/tasks/archive/` when complete, blocked, or handed off.

## Actions

- Started task record.
- Confirmed `zhangyiming.online` and `www.zhangyiming.online` currently have no A/CNAME records.
- Confirmed production backend `.env` did not previously define `PHOTO_OSS_HOST`.
- Added `PHOTO_OSS_HOST=https://yuanbo.online` to production backend `.env` and restarted PM2 once.
- Updated backend source to load `.env` at startup and default `PHOTO_OSS_HOST` to `https://yuanbo.online`.
- Removed logging of parsed `.env` values from the env watcher.
- Applied the same backend source changes on the primary server, rebuilt, and restarted PM2 `main`.
- Counted historical production DB URLs that still reference `zhangyiming.online`: 122 `Photo.filename` values and 1 `User.avatarUrl`.
- Checked sample historical files from those URLs on source/target storage; sample files were not present on the migrated `yuanbo.online` storage.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- `zhangyiming.online` currently has no DNS A/CNAME records.
- New uploads should use `yuanbo.online`, which now serves `/oss_service` and `/bofans_static` from the primary server.
- Do not rewrite historical DB URLs until the missing original zhangyiming-hosted files are recovered or intentionally declared lost.

## Files Touched

- `.agents/tasks/active/20260530-191243-photo-host-migration.md`
- `apps/backend-nest/src/const/env.ts`
- `apps/backend-nest/src/common/env.watcher.ts`
- Remote target: `/usr/soso/github/bo-chaos/apps/backend-nest/.env`
- Remote target: `/usr/soso/github/bo-chaos/apps/backend-nest/src/const/env.ts`
- Remote target: `/usr/soso/github/bo-chaos/apps/backend-nest/src/common/env.watcher.ts`

## Verification Evidence

- Local `pnpm -C apps/backend-nest build`: passed.
- Local `pnpm -C apps/backend-nest test -- --runInBand`: passed, 3 suites.
- Local `pnpm agent:lint`: passed.
- Remote `pnpm build` in backend app: passed after correcting a shell-quote issue.
- Remote `pm2 restart main --update-env`: succeeded; both `main` cluster processes online.
- Remote `dist/const/env.js` check: contains `yuanbo.online`, does not contain `zhangyiming.online`.
- Public DNS check: `zhangyiming.online` and `www.zhangyiming.online` had no A/CNAME records.

## Handoff / Archive Notes

- Final state: handoff
- Archive path: `.agents/tasks/archive/20260530-191243-photo-host-migration.md`
