# Task Record: Bo links countdown fit

- State: archived
- Started: 2026-05-04
- Archived: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Remove useless `查看全部` labels and fix command countdown overflow at wider web widths.

## Acceptance Boundaries

- Functional: `/bo` no longer shows `查看全部`; command countdown stays inside the bracketed frame across checked viewport widths.
- Verification: Run Astro build, browser-check `/bo`, inspect console logs, run `pnpm agent:lint`.
- Docs Sync: No L2 docs expected.
- Safety: Local Astro UI fix only.
- Archive: Create archive record when verification passes.

## Actions

- Removed useless `查看全部` labels from `动态` and `周边`.
- Removed now-unused update-time formatting from `/bo`.
- Changed command countdown columns to character-width sizing.
- Moved countdown font sizing to the grid container so `3ch / 2ch` columns are calculated from the actual digit size.

## Decisions and Assumptions

- Remove fake navigation text rather than linking it to placeholder pages.
- Keep the B-style countdown but constrain it by character-based columns and smaller responsive type.

## Files Touched

- `.agents/tasks/archive/2026-05-04-bo-links-countdown-fit.md`
- `apps/frontend-astro/src/components/tuixiu/countdown.astro`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- Browser check `http://127.0.0.1:4321/bo`: passed.
- Browser text checks: `查看全部` count `0`, `合成大鸽子` count `1`, `Reckful` count `1`.
- Countdown field checks: `days=793`, `hours=21`, `minutes=55`, `seconds=08` at verification time.
- Browser screenshot check: countdown digits no longer overlap or exceed the bracketed frame in the current in-app viewport.
- Browser console check after reload: recent error count `0`.
- Local Playwright import check: `playwright` and `@playwright/test` are not importable from the current root environment, so no scripted wide-viewport run was executed.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: archived.
