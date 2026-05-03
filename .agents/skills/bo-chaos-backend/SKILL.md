---
name: bo-chaos-backend
description: Use when changing bo-chaos NestJS backend APIs, services, auth, uploads, Prisma access, categories, photos, users, kowtow, or backend tests.
---

# bo-chaos Backend

Use this for `apps/backend-nest` and Prisma-backed API changes.

## Context

Read:

- `docs/agent/ARCHITECTURE.md`
- `docs/agent/CONVENTIONS.md`
- `docs/agent/QUALITY.md`
- `docs/agent/DATA_MODEL.md` when Prisma data is involved

## Workflow

1. Locate controller/service/module under `apps/backend-nest/src/bofans/`.
2. Keep controller methods thin and put Prisma logic in services.
3. Preserve existing response shapes unless the task explicitly changes the contract.
4. Validate user input at API boundaries for new unsafe inputs.
5. If Prisma schema changes, update `docs/agent/DATA_MODEL.md`.
6. Run the narrow backend tests or state why they were not run.

## Verification

- Prefer `pnpm -C apps/backend-nest test` for backend logic.
- Use `pnpm -C packages/prisma-client build` after Prisma schema changes.
- Run `pnpm agent:lint` before finishing.
