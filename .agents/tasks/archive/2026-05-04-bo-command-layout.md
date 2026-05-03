# Task Record: Bo command layout

- State: archived
- Started: 2026-05-04
- Archived: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Apply image2 direction B to `/bo`: a minimal tech command-center layout for three sections, with responsive first-viewport visibility.

## Acceptance Boundaries

- Functional: `/bo` adopts a minimal command-center layout; `动态`, `周边`, and `Fans` remain visible and clearly separated; no top navigation bar, no `来源页面`.
- Verification: Run Astro build, browser-check `/bo`, inspect console logs, run `pnpm agent:lint`.
- Docs Sync: No L2 agent docs expected; update task record evidence.
- Safety: Local Astro UI change only; no production writes, deploys, or external form actions.
- Archive: Create archive record when verification passes.

## Actions

- Added a command-style countdown variant.
- Applied the command-center layout to `/bo`.
- Reworked the three sections as numbered, thin-divider modules.
- Kept `周边` and `Fans` side by side even on narrow screens so Fans stays visible.
- Cropped design option B to `/private/tmp/bo-design-b-reference.png` and used it as the concrete reference.
- Reworked `/bo` again to match the B reference: single vertical terminal panel, centered bracketed countdown, command lines, section dividers, and terminal footer.
- Hid the command variant copy button visually and compressed vertical spacing so Fans enters the current viewport.

## Decisions and Assumptions

- Treat B as subtle technical structure, not a corporate console clone.
- Keep the site personal and minimal; avoid official/disclaimer copy.

## Files Touched

- `.agents/tasks/archive/2026-05-04-bo-command-layout.md`
- `apps/frontend-astro/src/components/tuixiu/countdown.astro`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`
- `apps/frontend-astro/src/pages/bo.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- Browser check `http://127.0.0.1:4321/bo`: passed.
- Browser text checks: `来源页面` count `0`; `Command Center`, `$ whoami`, `SYSTEM OK`, `合成大鸽子`, `Reckful`, `$ keep shipping` all count `1`.
- Visible DOM check: both `合成大鸽子` and `Reckful` are present in the current narrow viewport.
- Browser console check after reload: recent error count `0`.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: archived.
