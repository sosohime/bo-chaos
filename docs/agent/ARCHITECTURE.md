# Agent Architecture Map

This is the L2 architecture map for `bo-chaos`. Use it after `AGENTS.md` and before reading source files.

## System Shape

`bo-chaos` is a pnpm workspace with multiple TypeScript apps and shared packages:

- `apps/backend-nest`: NestJS backend. Owns API controllers, auth guard, centralized upload handling, Prisma access, and bofans business modules.
- `apps/front-next-admin`: Next.js admin UI. Owns admin login and photo review workflows.
- `apps/miniapp-taro`: Taro mini app. Owns WeChat user flows, photo browsing/uploading, voting, kowtow, and profile pages.
- `apps/frontend-astro`: Astro public site. Owns retirement countdown pages.
- `apps/bo-retire-vsc-extension`: VS Code extension for retirement countdown.
- `packages/prisma-client`: Prisma schema, generated client output, and migrations.
- `packages/const`: shared constants such as bofans photo status.
- `packages/utils`: shared utility functions and tests.
- `packages/types`: shared API DTO declarations used by backend, admin, and miniapp. Frontend apps should not import Prisma model types directly.
- `packages/ui`: shared shadcn-style React UI primitives.

## Backend Boundaries

Backend modules live under `apps/backend-nest/src/bofans/`.

- `auth`: WeChat login, JWT creation, auth guard.
- `users`: user profile APIs.
- `photo`: photo list/get/upload/vote/review operations.
- `category`: `PhotoCategory` CRUD used by review and upload flows.
- `kowtow`: kowtow behavior and daily stats.
- `global`: global stats endpoints.
- `bo`: lightweight Bo experience endpoints such as the daily inspiration card.

Use `PrismaService` from `apps/backend-nest/src/library/prisma.service.ts` for database access. Keep controller methods thin and put query/update logic in services.

## Frontend Boundaries

Admin UI:

- Pages live under `apps/front-next-admin/src/app/`.
- API wrappers live under `apps/front-next-admin/src/api/bofans/`.
- Shared fetch logic lives in `apps/front-next-admin/src/lib/api-client.ts`.
- UI primitives live in `apps/front-next-admin/src/components/ui/`.

Mini app:

- Pages live under `apps/miniapp-taro/src/pages/`.
- API wrappers live under `apps/miniapp-taro/src/api/`.
- Request/auth retry logic lives in `apps/miniapp-taro/src/lib/request.ts`.
- Upload history should use paginated photo APIs so old images are not loaded into the page all at once.

Astro:

- Pages live under `apps/frontend-astro/src/pages/`.
- React islands live under `apps/frontend-astro/src/components/`.

## Data Flow

- WeChat mini app logs in through backend auth and stores a JWT token locally.
- Mini app calls backend under `https://yuanbo.online/rpg/bofans` in production.
- Admin uses `/api` locally by default; `BOFANS_API_BASE_URL` controls the backend rewrite target and should point to local backend during development.
- Backend reads/writes PostgreSQL through Prisma.
- Photo uploads are processed in memory with `multer`, image metadata is read with `sharp`, then uploaded using an OSS token.

## Change Guidance

- API behavior changes usually touch backend controller/service, shared DTOs in `packages/types`, frontend API wrappers, and `docs/agent/ROUTING.md`.
- Schema changes touch Prisma schema, generated client workflow, backend services, shared DTOs, frontend type use, and `docs/agent/DATA_MODEL.md`.
- UI changes should follow the existing component library and the frontend debug workflow.
