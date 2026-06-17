# Task Record: BoFans architecture refresh

- State: completed
- Mode: full
- Started: 2026-06-17
- Branch: current
- Request: Take over the existing bo-chaos worktree, perform a breaking BoFans architecture refactor, and prepare production replacement on 101.34.252.219.

## Acceptance Boundaries

- Functional: Shared API contracts, Prisma schema, Nest backend boundaries, admin API wrappers, and miniapp API wrappers are migrated to the new architecture without reverting existing unrelated work.
- Verification: Run package/client/backend/admin/miniapp builds and tests where feasible; record any blockers.
- Docs Sync: Update OpenSpec and agent docs for schema, routing, commands, architecture, conventions, and deployment.
- Safety: Do not print secrets; take production inventory read-only before deploy; require backups before any production migration.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Captured local dirty worktree baseline; existing uncommitted changes are treated as prior in-progress work and must be preserved.
- Performed read-only SSH inventory of `bo-chaos-101`: host `VM-12-15-debian`, user `root`, PM2 processes `nextjs-app` and two `main` workers, app cwd `/usr/soso/github/bo-chaos`, nginx present under `/etc/nginx`.
- Implemented shared DTOs, Prisma enum/category migration, backend response/upload/auth boundaries, admin wrappers, and miniapp wrappers/pages.
- Created production backup at `/usr/soso/backups/bo-chaos-arch-20260617230540`.
- Uploaded and unpacked the local worktree bundle into `/usr/soso/github/bo-chaos`.
- Updated production env for new auth/CORS/upload keys after explicit user approval, without printing secret values.
- Ran production Prisma migration. The first attempt failed on enum default casting and the second on duplicate `(system, name)` categories; both were resolved via migration fixes, marked rolled back, and re-run successfully.
- Rebuilt packages/backend/admin on production, restarted PM2, diagnosed and fixed a backend restart loop caused by extensionless ESM workspace exports.
- Removed backend `.env` hot-reload from the startup path after identifying it as unsafe and capable of mutating parsed config.
- Restored public read semantics for categories, photo list/detail, and kowtow stats while keeping upload, vote, user, category creation, and admin review routes guarded.

## Iteration Log

- Production migration count check after success: `Photo=660`, `PhotoCategory=16`, `reviewing=538`.
- Production smoke after final restart: `system=200`, `categories=200/count 16`, `photos=200/count 1/total 14`, `photoDetail=200`, unauthenticated review `401`, authenticated review `200/count 1/total 538`, `kowtow=200`.
- Raw PM2 historical logs were not used after the security risk was identified; restart-loop diagnosis used a one-off sanitized `node dist/main.js` run.

## Deferred Verification

- `pnpm -C apps/front-next-admin build` completed on production. Locally, the Next build compiled and generated pages but the Nx process did not terminate and was interrupted before this final production deploy cycle.

## Decisions and Assumptions

- Breaking API changes and Prisma migration are in scope.
- Existing local worktree changes are part of the takeover baseline.
- Production secrets are not printed into logs or chat.
- Approved production defaults: preserve the admin account, store only a SHA256 password hash, enable secure admin cookies, allow `https://yuanbo.online` and local admin origin in CORS, set max upload size to 8 MiB.

## Files Touched

- `.agents/tasks/archive/2026-06-17-bo-fans-architecture-refresh.md`
- `openspec/changes/bo-fans-architecture-refresh/proposal.md`

## Verification Evidence

- `ssh bo-chaos-101 ...`: read-only production inventory succeeded.
- `pnpm -C packages/prisma-client build`: passed after running outside sandbox.
- `pnpm -C apps/backend-nest test -- --runInBand`: 5 suites / 7 tests passed.
- `pnpm -C apps/backend-nest build`: passed.
- `pnpm -C apps/front-next-admin exec tsc --noEmit --pretty false`: passed.
- `pnpm -C apps/miniapp-taro build:weapp`: passed.
- `pnpm run verify`: passed.
- `pnpm agent:lint`: passed.
- `pnpm -C apps/front-next-admin build`: Next compiled and generated pages, but Nx process did not terminate and was interrupted.
- Production backup: `/usr/soso/backups/bo-chaos-arch-20260617230540`.
- Production `pnpm run build:packages`: passed.
- Production `pnpm -C apps/backend-nest build`: passed.
- Production `pnpm -C apps/front-next-admin build`: passed, with a non-fatal ESLint internal warning and transient Google font retries.
- Production `pnpm -C packages/prisma-client prisma migrate deploy`: passed after resolving failed attempts as rolled back.
- Production PM2 `main` and `nextjs-app`: online after final restart.
- Final `pnpm run verify`: passed.
- Final `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/2026-06-17-bo-fans-architecture-refresh.md`
