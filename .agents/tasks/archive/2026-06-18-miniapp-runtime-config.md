# Task Record: miniapp runtime config

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Add flexible mini app dynamic configuration, especially a one-click switch to hide UGC.

## Acceptance Boundaries

- Functional: backend system config returns a structured mini app runtime config; mini app caches and consumes it; `miniapp.ugc.enabled=false` hides UGC pages, upload surfaces, upload history, and UGC tab entries.
- Verification: mini app build, backend build, backend tests where feasible, and agent lint.
- Docs Sync: document runtime config and UGC kill switch conventions.
- Safety: this is operational flexibility, not review evasion; no production deploy, data change, or secret exposure.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Extended shared BoFans config types with `BofansMiniappRuntimeConfig`.
- Added backend default mini app runtime config and optional `BOFANS_WEAPP_RUNTIME_CONFIG` JSON override.
- Added mini app runtime config defaults, normalization, and local cache.
- Enabled custom tab bar and made tab labels/visibility runtime-configurable.
- Added `miniapp.ugc.enabled` handling across photo pages, upload history, personal upload section, approval page, and UGC tab entries.
- Prevented UGC hooks from fetching data while UGC is disabled.
- Added a unified disabled state for UGC pages.

## Iteration Log

- User clarified the goal as flexible dynamic configuration, not bypassing review.
- User added that UGC must be one-click hideable; implemented `miniapp.ugc.enabled` as the single switch.

## Deferred Verification

- WeChat DevTools visual preview was not rerun in this pass.
- Production runtime config was not changed.

## Decisions and Assumptions

- The first version uses environment JSON override instead of a database-backed admin UI to avoid adding schema and admin surface area before the config contract settles.
- Existing `inReview` remains for backward compatibility, but new flexible mini app behavior should use the nested `miniapp` config.
- Example UGC-off override: `{"ugc":{"enabled":false}}`.

## Files Touched

- `packages/types/src/api/bofans.d.ts`
- `apps/backend-nest/src/const/env.ts`
- `apps/backend-nest/src/bofans/global/global.controller.ts`
- `apps/miniapp-taro/src/lib/runtime-config.ts`
- `apps/miniapp-taro/src/lib/context.ts`
- `apps/miniapp-taro/src/app.tsx`
- `apps/miniapp-taro/src/app.config.ts`
- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/features/photos/UgcDisabledState.tsx`
- `apps/miniapp-taro/src/features/photos/use-system-photo-groups.ts`
- `apps/miniapp-taro/src/features/photos/use-waterfall-photos.ts`
- `apps/miniapp-taro/src/features/upload/use-upload-history.ts`
- `apps/miniapp-taro/src/pages/history/index.tsx`
- `apps/miniapp-taro/src/pages/travel/index.tsx`
- `apps/miniapp-taro/src/pages/tease/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `docs/agent/CONVENTIONS.md`
- `.agents/tasks/archive/2026-06-18-miniapp-runtime-config.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm -C apps/backend-nest build`: passed.
- `pnpm -C apps/backend-nest test -- --runInBand`: passed, 5 suites and 7 tests.
- `pnpm agent:lint`: initially warned for backend architecture doc sync and AGENTS TOC sync; both docs were updated.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-runtime-config.md`
