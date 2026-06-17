# Agent Conventions

Follow existing code first. These conventions document current patterns and guardrails.

## TypeScript and Workspace

- Use TypeScript throughout.
- Keep package imports consistent with existing aliases such as `@/` inside apps and `@mono/*` for workspace packages.
- Prefer `rg` for search.
- Do not introduce new dependencies unless the task clearly requires them.

## Nest Backend

- Keep controllers thin: parse request data, call services, return DTO-like objects.
- Put Prisma queries and mutations in services.
- Use `AuthGuard` for protected bofans routes.
- Use `Logger` for notable backend operations and failures.
- Keep route prefixes consistent: existing bofans routes live under `bofans/*`.
- Avoid changing response shapes without checking all frontend consumers.
- Return BoFans API payloads as `{ data, meta? }`; pagination metadata belongs in `meta`.
- Keep upload handling in the shared backend upload service rather than controllers.

## Prisma

- Schema source: `packages/prisma-client/prisma/schema.prisma`.
- Generated client output: `packages/prisma-client/dist`.
- Do not edit generated client output by hand.
- If schema changes, update `docs/agent/DATA_MODEL.md` and consider migration implications.
- Prefer additive schema changes when possible.

## Admin Next

- Admin uses Next app router under `apps/front-next-admin/src/app/`.
- Client pages use `"use client"` where hooks/state are needed.
- Use existing shadcn-style UI components from `src/components/ui/`.
- Use `apiFetch` from `src/lib/api-client.ts` unless a file already uses a narrower local wrapper.
- Use shared DTOs from `@mono/types`; do not import `@mono/prisma-client` in admin UI code.
- Remember `basePath` is `/rpg/admin`.

## Miniapp Taro

- Use the `http` helper from `apps/miniapp-taro/src/lib/request.ts`.
- The request helper handles JWT storage and 401 re-login.
- Use `uploadFile` from `src/lib/request.ts` for authenticated Taro uploads instead of hand-rolling `Taro.uploadFile` in API wrappers.
- Keep reusable photo list behavior under `src/features/photos/`; pages should own page title/share/shell concerns and consume feature hooks/components for grouped lists or waterfall grids.
- Image-heavy mini app pages must use paginated API calls, `onScrollToLower` loading, `Image lazyLoad`, and visible loading/empty/error/footer states.
- Keep page config, TSX, and SCSS together under each page folder.
- Do not switch the production `BASE_URL` casually.
- Configure the API base URL through `BOFANS_API_BASE_URL`; do not hard-code production API targets in source.
- Use shared DTOs from `@mono/types`; do not import `@mono/prisma-client` in miniapp code.
- Use pagination and `lazyLoad` for image-heavy history grids instead of rendering every historical upload at once.
- Preserve true image laziness in miniapp feeds: avoid `getImageInfo`-style eager image probes for every list item unless backend dimensions are unavailable and the UX explicitly depends on exact layout.
- Keep upload interactions queue-based and recoverable: cap large image selections, limit concurrent uploads, leave failed items available for retry, and show a clear post-submit path to review history.
- Keep mini app visual refreshes cohesive across page shells, navigation bar, tab bar, feed cards, upload controls, and review surfaces; avoid mixing new dark/tech page bodies with legacy blue-white chrome.

## Astro

- Use Astro pages for static/public routes.
- Prefer Astro components for static route shells, layout, and link sections.
- Keep React components as narrow client islands for stateful interactions such as countdowns and copy buttons.
- Do not wrap a React client island inside a static React parent when an Astro wrapper can own the structure.
- Public site routes are deployed under `/retire`. Build internal links and public asset URLs with `sitePath('/...')` from `apps/frontend-astro/src/lib/site-paths.ts`; do not hard-code `/retire` in page/component source.
- Place public assets relative to the deploy root, such as `apps/frontend-astro/public/codex-pets/example.png`, not under `apps/frontend-astro/public/retire/`.
- Retirement countdown pages use `src/components/tuixiu/countdown.astro` with a small browser script instead of React hooks, avoiding stale Vite React chunks in Chrome.
- Keep countdown constants in shared packages when they apply across apps.
- Keep Bo retirement target, canonical retirement cycle, and derived progress baseline in `@mono/const`; apps should not hard-code local retirement dates, progress starts, or expose internal cycle math in UI copy.
- For mockup-driven Astro pages, translate the reference into explicit desktop and mobile layout structures up front. Do not rely on shrinking a desktop composition after implementation.
- Keep sensitive or specific personal role details out of public retirement page copy unless the user explicitly asks to publish them; use visual motifs and generic status language instead.

## UI Quality

- Use existing visual language before inventing new patterns.
- Include loading, empty, and error states when changing user-facing data UI.
- Keep controls keyboard accessible.
- Avoid generic AI-looking visual defaults that do not match the existing app.
