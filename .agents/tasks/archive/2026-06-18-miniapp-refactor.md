# Task Record: Miniapp refactor

- State: completed
- Mode: full
- Started: 2026-06-18
- Branch: main
- Request: Refactor the Taro mini app after the BoFans architecture refresh.

## Acceptance Boundaries

- Functional: Preserve current mini app behavior while reducing duplicate API/page logic and aligning mini app code with shared DTOs.
- Scope: `apps/miniapp-taro` plus task/docs records only unless verification reveals a shared-contract issue.
- Verification: Run `pnpm -C apps/miniapp-taro build:weapp` and `pnpm agent:lint`.
- Manual QA: WeChat DevTools visual/runtime verification is not available in this environment; note this in final.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Routed work to `apps/miniapp-taro` with API wrappers and shared DTOs as secondary context.
- Added shared mini app request utilities for query-string building, `{ data, meta }` response unwrapping, and authenticated `Taro.uploadFile`.
- Refactored mini app photo pages around `src/features/photos` hooks/components:
  - grouped category photo sections for history/travel
  - waterfall photo layout for tease
  - shared preview/grouping helpers
- Aligned `PhotoItem`, upload APIs, kowtow API, and the My page with shared DTOs while preserving current behavior.
- Removed stale debug logs and dead image config from the kowtow API wrapper.
- Updated `docs/agent/CONVENTIONS.md` with the new mini app feature/request boundaries.

## Verification Evidence

- `pnpm -C apps/miniapp-taro build:weapp`: passed when run outside the sandbox; sandboxed run hung after a Taro dependency system-configuration warning.
- `pnpm -C apps/miniapp-taro exec tsc --noEmit --pretty false`: not used as a final gate because it reports existing Taro dependency declaration errors unrelated to this change.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-refactor.md`
