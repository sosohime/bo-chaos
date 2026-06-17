# Task Record: retirement cycle system check

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: main
- Request: Correct the mini app retirement progress from the arbitrary 48% baseline to the canonical retirement rule and inspect the whole retirement system.

## Acceptance Boundaries

- Functional: Bo retirement progress uses the canonical cycle ending on the shared Bo retirement date, with the mini app showing the same target as the retirement site and extension.
- Verification: Build shared constants, mini app, Astro retirement site, and VS Code extension; scan for stale hard-coded progress dates.
- Docs Sync: Record the shared constant rule in agent conventions.
- Safety: No production writes, deploys, data changes, or secret exposure.
- Archive: Store this completed record under `.agents/tasks/archive/`.

## Actions

- Added `tencentRetireYears` and `boTuiXiuStartDay` to `packages/const/src/tuixiu.ts`.
- Updated the mini app retirement page to calculate progress from the shared derived start date to `boTuiXiuDay`.
- Kept the public Astro retirement page on the shared `boTuiXiuDay` countdown source.
- Fixed the VS Code extension compile path by dynamically importing shared constants and calculating countdown time without static ESM workspace imports.
- Searched the workspace for stale `2024-07-06`, `2025-01-01`, and 48% retirement progress baselines.
- Added an agent convention requiring retirement targets and progress baselines to come from `@mono/const`.

## Iteration Log

- Not applicable.

## Deferred Verification

- WeChat DevTools manual preview was not rerun in this pass; the mini app production-target build passed.

## Decisions and Assumptions

- The progress start is derived in shared constants from the canonical target date `2028-07-06`, producing `2013-07-06`.
- The old archived task record mentioning a four-year observation cycle is historical evidence, not active application logic.

## Files Touched

- `packages/const/src/tuixiu.ts`
- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/bo-retire-vsc-extension/src/extension.ts`
- `docs/agent/CONVENTIONS.md`
- `.agents/tasks/archive/2026-06-18-retirement-cycle-system-check.md`

## Verification Evidence

- `pnpm -C packages/const build`: passed.
- Date sanity check for `2013-07-06 -> 2028-07-06` on `2026-06-18`: progress is about `86.33%`, remaining about `13.67%`.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed.
- `pnpm -C apps/frontend-astro build`: passed with existing Sentry auth token and Browserslist warnings.
- `pnpm -C apps/bo-retire-vsc-extension compile`: passed after the dynamic import fix.
- `pnpm agent:lint`: passed.
- `packages/const build` and extension compile should not run in parallel because the const package `prebuild` removes `dist`, briefly hiding workspace package types from extension compilation.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-retirement-cycle-system-check.md`
