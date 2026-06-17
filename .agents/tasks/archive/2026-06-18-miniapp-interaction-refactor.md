# Task Record: miniapp interaction refactor

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: main
- Request: 大改小程序交互，搞到合理。

## Acceptance Boundaries

- Functional: improve miniapp browsing, upload, review-history, and kowtow interactions without changing backend response shapes.
- Verification: run `pnpm -C apps/miniapp-taro build:weapp` and `pnpm agent:lint`; note WeChat DevTools manual verification if unavailable.
- Docs Sync: update agent docs only if conventions or workflow expectations change.
- Safety: no production writes, no secrets, no API base URL changes, no destructive data operations.
- Archive: move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record for the interaction refactor.
- Reworked grouped image browsing so user-collapsed categories stay collapsed across pagination.
- Replaced waterfall eager `getImageInfo` probes with deterministic height estimates to preserve true image laziness.
- Reworked upload interaction with step indicators, max selection guard, limited upload concurrency, failed-item retry, and post-submit review entry.
- Changed personal upload history from two stacked grids to a focused pending/approved tab view.
- Hardened photo card vote/download interactions with action locking, optimistic rollback, and clearer download failure feedback.
- Hardened kowtow sync with recoverable sync errors and clearer button state.
- Made tab labels self-explanatory while keeping the BoFans tone.
- Added category/status metadata to the approval history grid.
- Updated miniapp conventions for lazy image feeds and recoverable upload queues.
- Ran the mini app in WeChat DevTools with a local mock API, removed invalid tabBar `index` fields, aligned page titles with tab labels, and moved unsupported scroll-view padding to inner/footer elements.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools runtime verification may remain manual-only in this environment.

## Decisions and Assumptions

- Treat the latest request as approval for broad local miniapp interaction changes.
- Keep backend DTOs and API response shapes unchanged.

## Files Touched

- `.agents/tasks/archive/2026-06-18-miniapp-interaction-refactor.md`
- `apps/miniapp-taro/src/app.config.ts`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/components/photoItem/index.scss`
- `apps/miniapp-taro/src/features/photos/use-system-photo-groups.ts`
- `apps/miniapp-taro/src/features/photos/use-waterfall-photos.ts`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.scss`
- `apps/miniapp-taro/src/pages/history/index.config.ts`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/pages/my/index.config.ts`
- `apps/miniapp-taro/src/pages/tease/index.config.ts`
- `apps/miniapp-taro/src/pages/travel/index.config.ts`
- `apps/miniapp-taro/src/app.scss`
- `docs/agent/CONVENTIONS.md`

## Verification Evidence

- `pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully. Existing warnings: Node `punycode` deprecation and stale Browserslist data.
- `pnpm agent:lint`: passed.
- WeChat DevTools runtime verification: launched `apps/miniapp-taro/dist`, ran against local mock API at `127.0.0.1:3000`, verified kowtow, history, and my page render without current console errors after clearing historical logs.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-interaction-refactor.md`
