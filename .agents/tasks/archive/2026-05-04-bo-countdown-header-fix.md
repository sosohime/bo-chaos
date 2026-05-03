# Task Record: Bo countdown header fix

- State: archived
- Started: 2026-05-04
- Archived: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Fix the broken center countdown and remove the mockup-only `B / Command Center` header from `/bo`.

## Acceptance Boundaries

- Functional: `/bo` countdown renders day/hour/minute/second values; mockup labels such as `B` and `Command Center` are not visible.
- Verification: Run Astro build, browser-check `/bo`, inspect console logs, run `pnpm agent:lint`.
- Docs Sync: No L2 agent docs expected.
- Safety: Local Astro UI fix only.
- Archive: Create archive record when verification passes.

## Actions

- Added `days`, `hours`, `minutes`, and `seconds` to the countdown render data so the command layout fields can update.
- Removed the mockup-only `B / Command Center` header from `/bo`.
- Stopped rendering the copy button in the command variant so it no longer leaks into the layout or interactive tree.

## Decisions and Assumptions

- Keep the internal terminal flavor (`$ whoami`, `SYSTEM OK`) because it belongs to the actual B layout; remove only the external mockup label/header.

## Files Touched

- `.agents/tasks/archive/2026-05-04-bo-countdown-header-fix.md`
- `apps/frontend-astro/src/components/tuixiu/countdown.astro`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- Browser check `http://127.0.0.1:4321/bo`: passed.
- Browser text checks: `B` count `0`, `Command Center` count `0`, `复制倒计时` count `0`, `$ whoami` count `1`, `SYSTEM OK` count `1`, `合成大鸽子` count `1`, `Reckful` count `1`.
- Countdown field checks: `days=793`, `hours=21`, `minutes=58`, `seconds=44` at verification time.
- Browser console check after reload: recent error count `0`.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: archived.
