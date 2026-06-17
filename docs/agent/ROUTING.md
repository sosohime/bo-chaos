# Agent Task Routing

Use this file to locate the right code area before broad search.

## Request Keywords

| Request mentions                                          | Start here                                                   | Also inspect                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| admin, review, audit, approve, reject, category selection | `apps/front-next-admin/src/app/bofans_admin/review/page.tsx` | `apps/front-next-admin/src/api/bofans/`, backend `photo.controller.ts`  |
| login, token, auth, JWT, WeChat code                      | `apps/backend-nest/src/bofans/auth/`                         | mini app `src/lib/request.ts`, admin `src/lib/api-client.ts`            |
| photo upload, image size, OSS, sharp, multer              | `apps/backend-nest/src/bofans/photo/`                        | mini app `src/api/photo.ts`, Prisma `Photo` model                       |
| photo list, vote, cancel vote, waterfall                  | `apps/backend-nest/src/bofans/photo/`                        | mini app `src/pages/*`, `src/components/photoItem/`                     |
| upload history, review pagination, Bo daily card          | `apps/backend-nest/src/bofans/photo/`                        | mini app `src/pages/my/`, admin review page, backend `bo/`              |
| category, second category, system history/travel/tease    | `apps/backend-nest/src/bofans/category/`                     | shared DTOs in `packages/types/src/api/bofans.d.ts`, Prisma schema      |
| kowtow, daily stats, trends                               | `apps/backend-nest/src/bofans/kowtow/`                       | Prisma `UserDailyBehavior`, `GlobalDailyStats`                          |
| mini app page, Taro, WeChat UI                            | `apps/miniapp-taro/src/pages/`                               | `apps/miniapp-taro/src/api/`, `src/lib/request.ts`                      |
| admin UI, shadcn, sidebar, table, dialog                  | `apps/front-next-admin/src/`                                 | `packages/ui/src/ui/` if shared components are needed                   |
| retirement countdown, Astro, public page                  | `apps/frontend-astro/src/`                                   | `packages/const/src/tuixiu.ts`, hooks under `frontend-astro/src/hooks/` |
| VS Code extension, status bar, command                    | `apps/bo-retire-vsc-extension/src/extension.ts`              | extension package scripts and images                                    |
| Prisma, DB, migration, model, generated client            | `packages/prisma-client/prisma/schema.prisma`                | backend services, `docs/agent/DATA_MODEL.md`                            |
| shared date/image/class utils                             | `packages/utils/src/`                                        | package tests in `packages/utils/src/*.test.ts`                         |
| constants, photo status, birthday, bofans                 | `packages/const/src/`                                        | consuming apps                                                          |

## Routing Rules

- Prefer the narrow app/package from the table before running wide searches.
- If changing an API, inspect both caller and server endpoint.
- If changing a model or enum-like string, search all apps for consumers.
- If changing frontend behavior, read `docs/agent/FRONTEND_DEBUG.md` before finishing.
- If changing docs or key source paths, run `pnpm agent:lint`.

## Example Routes

- "Add a filter to the review page": start in `apps/front-next-admin/src/app/bofans_admin/review/page.tsx`, then inspect `apps/front-next-admin/src/api/bofans/review.ts`; only inspect backend if the filter needs server support.
- "Add photo statistics endpoint": start in `apps/backend-nest/src/bofans/photo/`, inspect Prisma models and relevant tests.
- "Change Photo schema": start in Prisma schema, then update backend service/controller consumers, frontend type assumptions, and `docs/agent/DATA_MODEL.md`.
