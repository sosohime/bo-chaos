# Task Record: Miniapp product refactor

- State: completed
- Mode: full
- Started: 2026-06-18
- Branch: main
- Request: Thoroughly diagnose and refactor the mini app, including lazy loading, page design, and unreasonable UX after the architecture refactor.

## Acceptance Boundaries

- Functional: Preserve backend contracts while improving mini app loading behavior, photo browsing, upload ergonomics, empty/error/loading states, and page structure.
- Scope: `apps/miniapp-taro`, task/docs records, and agent docs when conventions change.
- Verification: `pnpm -C apps/miniapp-taro build:weapp`, `pnpm agent:lint`.
- Manual QA: WeChat DevTools visual/runtime verification is unavailable; note this in final.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Diagnosis

- History/travel/tease only requested the API default first page, so large photo sets were silently missing and there was no real lazy paging.
- Photo cards did not set `Image lazyLoad`, and page footers did not tell users whether more data existed.
- History page CSS had its grid columns commented out, making the layout effectively one-column and inconsistent with travel.
- Shared photo pages lacked explicit loading, error, empty, and bottom states.
- Approve page was a mostly empty shell: mock counts, `peding` spelling, no real photo data, no lazy loading, and a web `<div>` inside Taro UI.
- My page duplicated upload-history pagination logic and did not support previewing selected/history images directly.

## Actions

- Continuing from the existing uncommitted mini app refactor baseline.
- Added paginated system photo hooks with page size, `hasMore`, loading/error state, refresh, and `onScrollToLower` loading.
- Added shared photo browser styles for grouped category lists, waterfall grids, list states, and page footers.
- Rebuilt history/travel/tease around real paginated loading and lazy-loaded `PhotoItem` images.
- Replaced the approve page with a real pending/approved upload-history browser, real counts, lazy image grid, and preview support.
- Reused upload-history pagination in the My page and added selected/history image preview behavior.
- Cleaned stale `peding` state, mock approval counts, unused imports, empty hooks, and invalid Taro/web markup.
- Updated mini app conventions to require paginated image-heavy pages with `lazyLoad` and explicit states.

## Verification Evidence

- `pnpm -C apps/miniapp-taro build:weapp`: passed outside the sandbox.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-product-refactor.md`
