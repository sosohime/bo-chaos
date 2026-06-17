# Task Record: Bo Daily and upload performance

- State: complete
- Mode: full
- Started: 2026-05-29
- Branch: main
- Request: Add a Bo daily inspiration feature and improve admin review plus miniapp upload history performance/UI.

## Acceptance Boundaries

- Functional: Add a small Bo daily card API/UI path that connects existing user/photo/kowtow-style data without broad autonomous AI behavior; improve upload review/admin and miniapp upload history with pagination or virtualization where needed.
- Verification: Run narrow builds/tests where feasible for touched backend/admin/miniapp areas plus `pnpm agent:lint`.
- Docs Sync: Update agent docs only if routing, architecture, data model, or workflow contracts change.
- Safety: Do not perform write actions against production admin APIs; avoid Prisma schema changes unless required.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Loaded repo routing, backend, admin, miniapp, and doc sync playbooks.
- Added a lightweight authenticated Bo daily card API under `apps/backend-nest/src/bofans/bo/`.
- Added paginated `myUploaded` and `reviewList` photo responses with legacy endpoints left in place.
- Updated the admin review page to request one page at a time, lazy-load thumbnails, clear selections on page changes, and expose previous/next controls.
- Updated the miniapp My page with a Bo daily card, lazy-loaded paginated upload history, pull-to-refresh reloads, and bottom/load-more pagination.
- Synced agent docs for the new Bo backend boundary and image-heavy pagination conventions.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- Keep the first Bo daily feature rule-based/cache-free unless existing data models make caching cheap.
- Treat miniapp upload history virtual scrolling as the highest performance priority because the user called out bandwidth pressure.
- Use pagination plus image lazy loading before introducing a heavier virtual list dependency; this directly reduces request payload and rendered image count.
- Leave Prisma schema unchanged; the Bo card is computed from existing user, photo, and kowtow data.

## Files Touched

- `.agents/tasks/archive/2026-05-29-bo-daily-upload-performance.md`
- `AGENTS.md`
- `apps/backend-nest/src/bofans/bo/bo.controller.ts`
- `apps/backend-nest/src/bofans/bo/bo.module.ts`
- `apps/backend-nest/src/bofans/bo/bo.service.ts`
- `apps/backend-nest/src/bofans/bofans.module.ts`
- `apps/backend-nest/src/bofans/photo/photo.controller.ts`
- `apps/backend-nest/src/bofans/photo/photo.service.ts`
- `apps/front-next-admin/src/api/bofans/review.ts`
- `apps/front-next-admin/src/app/bofans_admin/review/page.tsx`
- `apps/miniapp-taro/src/api/bo.ts`
- `apps/miniapp-taro/src/api/photo.ts`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `docs/agent/ARCHITECTURE.md`
- `docs/agent/CONVENTIONS.md`
- `docs/agent/FRONTEND_DEBUG.md`
- `docs/agent/ROUTING.md`

## Verification Evidence

- `pnpm run build:backend`: passed.
- `pnpm -C apps/backend-nest test -- --runInBand`: passed, 3 suites / 3 tests.
- `pnpm -C apps/front-next-admin exec tsc --noEmit`: passed.
- `pnpm agent:lint`: passed.
- `pnpm -C apps/front-next-admin build`: blocked by Nx plugin worker startup in sandbox; direct `next build` was blocked by Google Fonts network fetch even after escalation.
- `pnpm -C apps/miniapp-taro build:weapp`: sandbox run hung after macOS system-configuration panic; escalated run reached webpack and failed on existing `@mono/utils` dayjs timezone resolution.
- `pnpm -C apps/miniapp-taro exec tsc --noEmit`: blocked by existing Taro ambient type/dependency errors and pre-existing unused imports in unrelated pages.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-29-bo-daily-upload-performance.md`
