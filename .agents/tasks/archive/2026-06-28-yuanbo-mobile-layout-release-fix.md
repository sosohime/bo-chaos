# Task Record: yuanbo mobile layout release fix

- State: active
- Mode: full
- Started: 2026-06-28
- Branch: codex/main-yuanbo-prologue
- Request: Fix the Yuanbo game mobile layout because the current phone UI is disordered and unplayable.

## Acceptance Boundaries

- Functional: Mobile battle and ending screens fit short phone viewports without overlapping controls, hidden buttons, or horizontal overflow.
- Verification: Run local screenshot probes for 390px mobile heights, Yuanbo static/browser probes, Astro build, root verify, and `pnpm agent:lint`.
- Docs Sync: Agent docs are unaffected because this is a page-level rendering fix.
- Safety: No production writes other than the explicitly requested push to `main`; no secrets or backend data touched.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Reused the existing `codex/main-yuanbo-prologue` worktree to avoid unrelated dirty files in the main checkout.
- Updated mobile battle layout to compute table, focus, and skill button regions from viewport height.
- Added a compact mobile battle focus card for low-height phones.
- Added a low-height mobile negotiation table branch so dialogue no longer overlaps risk tokens.
- Updated mobile ending layout to reserve bottom space and place action buttons side by side.
- Confirmed agent docs are unaffected because this does not change routing, commands, architecture, workflow, or data contracts.

## Iteration Log

- User reported the mobile UI is badly disordered and unplayable.

## Deferred Verification

- None.

## Decisions and Assumptions

- Treat 390x667 as the harsh baseline because browser chrome can shrink usable height below the previous 390x844 checks.
- Keep the fix narrow to the existing prologue renderer instead of reopening the full game design scope.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/prologue.ts`
- `.agents/tasks/active/2026-06-28-yuanbo-mobile-layout-release-fix.md`

## Verification Evidence

- Mobile screenshot probe at 390x667, 390x724, 390x844, and 430x932 for imported battle and ending states: passed with `overflowX=0`, `bottomOverflow=0`, and `bridgeHidden=true`.
- Visual screenshots inspected:
  - `/tmp/yuanbo-mobile-390x667-battle-releasefix3.png`
  - `/tmp/yuanbo-mobile-390x667-ending-releasefix3.png`
  - `/tmp/yuanbo-mobile-390x844-battle-releasefix3.png`
- `pnpm probe:yuanbo`: passed.
- `pnpm probe:yuanbo:objective`: passed.
- `pnpm probe:yuanbo:copy`: passed.
- `pnpm probe:yuanbo:duration`: passed, estimate `30.7min`.
- `YUANBO_URL='http://127.0.0.1:4323/retire/bo/yuanbo-game/?qa=1' pnpm probe:yuanbo:browser`: passed, screenshots in `/tmp/yuanbo-prologue-qa`.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm run verify`: passed.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-28-yuanbo-mobile-layout-release-fix.md`
