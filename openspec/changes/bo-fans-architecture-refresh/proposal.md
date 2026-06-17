# BoFans Architecture Refresh

## Problem

BoFans has grown across a Nest backend, Next admin app, Taro miniapp, Prisma client, and shared packages without a strong contract layer. Frontends import Prisma model types directly, API response shapes vary by endpoint, photo upload and review logic sits inside controllers, and production API targets are hard-coded in client source.

## Proposed Behavior

- Prisma owns durable domain state with explicit enums for photo status and category system.
- `@mono/types` owns shared API request/response DTOs used by backend, admin, and miniapp.
- Backend controllers validate DTOs and delegate business logic to services/repositories.
- Upload handling is centralized with file type, size, metadata, timeout, and OSS error validation.
- Auth, cookies, CORS, and runtime configuration fail closed when required secrets are missing.
- Admin and miniapp consume typed API clients and environment-controlled API targets.
- Production rollout includes inventory, backups, migration, smoke tests, and rollback notes.

## Scenarios

### Photo Listing

When a miniapp client requests photos for a category system, the backend returns only client-safe DTOs and pagination metadata. The response does not expose Prisma relation internals such as `_count` or `votes`.

### Review Workflow

When an admin reviewer loads pending photos, the admin API returns a typed page of review DTOs. When approval or rejection is submitted, the backend validates ids, target category, and requested status before applying updates.

### Upload

When a user uploads a photo or avatar, the backend validates file presence, MIME type, file size, dimensions, and OSS result before writing database state.

### Production Rollout

Before production replacement, the current database, release directory, env file, PM2 config, and reverse proxy config are backed up. If smoke tests fail after deploy, the previous release and database snapshot can be restored.

## Verification

Run local checks:

```sh
pnpm -C packages/prisma-client build
pnpm run build:packages
pnpm -C apps/backend-nest test -- --runInBand
pnpm -C apps/backend-nest build
pnpm -C apps/front-next-admin build
pnpm -C apps/miniapp-taro build:weapp
pnpm run verify
pnpm agent:lint
```

Run production checks after backups and replacement:

```sh
pm2 status
curl -fsS https://yuanbo.online/rpg/bofans/global/systemConfig
```
