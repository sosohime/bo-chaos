# Task Record: yuanbo game gameplay responsive rework

- State: active
- Mode: full
- Started: 2026-06-22
- Branch: codex/miniapp-tech-refactor
- Request: Improve 袁博の极限售后 because it is not fun and has poor page adaptation.

## Acceptance Boundaries

- Functional: Make the page feel more like an actual game with clearer round decisions, risk/reward feedback, goals, and better desktop/mobile layout.
- Verification: Browser-check the current local route at desktop and mobile sizes, run `pnpm -C apps/frontend-astro build`, and run `pnpm agent:lint`.
- Docs Sync: Agent docs are unaffected unless architecture, commands, routing, data models, or workflow rules change.
- Safety: No backend, production writes, schema changes, deploys, pushes, or secrets handling.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Started from user feedback that the game was not fun and responsive layout was poor.
- Identified first-pass issues: oversized art, weak turn feedback, action buttons without visible stakes, mobile state pushed too far below the playable area.
- Added top HUD for cash, next upgrade target, and operational state.
- Added per-round result card with title, explanation, and concrete stat deltas.
- Added action previews showing success odds, expected reward, state cost, or recovery.
- Tightened desktop layout by preventing the main grid panel from stretching to match the side panel height.
- Reworked mobile layout so the title, HUD, result, event, and action buttons fit much earlier in the first viewport.

## Iteration Log

- N/A.

## Deferred Verification

- N/A.

## Decisions and Assumptions

- Keep the existing Astro-only/localStorage architecture and focus the rework inside the game page.
- Prioritize event card, resource state, expected reward/risk, and result feedback above decorative illustration on mobile.
- Keep mobile touch targets large while tightening desktop action buttons.

## Files Touched

- `.agents/tasks/active/2026-06-22-yuanbo-game-gameplay-responsive-rework.md`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- Browser current narrow viewport before rework: action buttons started around 807px down the page; stage height was 512px.
- Browser after rework at 390x844: action buttons start around 553px and end around 726px, no horizontal overflow, no console errors.
- Browser at 1280x800: action buttons start around 712px and end around 801px, no horizontal overflow, no console errors.
- Browser interaction: clicking `收钱报价` advanced day and showed result title, explanation, and concrete deltas such as cash, reputation, patience, energy, dignity, and XP.
- `pnpm -C apps/frontend-astro build`: passed; generated `/bo/yuanbo-game/index.html`.
- `pnpm agent:lint`: passed with warnings from pre-existing unrelated active miniapp/doc worktree state (`multiple-active-tasks`, missing Mode in `.agents/tasks/active/2026-06-22-miniapp-photo-browser-polish.md`, agent docs changed without AGENTS.md changing).

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-22-yuanbo-game-gameplay-responsive-rework.md`
