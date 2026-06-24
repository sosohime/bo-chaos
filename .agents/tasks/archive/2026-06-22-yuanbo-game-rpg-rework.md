# Task Record: yuanbo game rpg rework

- State: active
- Mode: full
- Started: 2026-06-22
- Branch: codex/miniapp-tech-refactor
- Request: Replace fake Bo character with existing Bo art and make 袁博の极限售后 a qualified RPG with growth and multi-branch story.

## Acceptance Boundaries

- Functional: Use existing Bo image assets, add RPG structure with growth, chapters, branch routes, choices, and story progression.
- Verification: Browser-check current localhost route, run `pnpm -C apps/frontend-astro build`, and run `pnpm agent:lint`.
- Docs Sync: Agent docs are unaffected unless architecture, commands, routing, data models, or workflow rules change.
- Safety: No backend, production writes, schema changes, deploys, pushes, or secrets handling.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Located existing Bo art under `apps/frontend-astro/public/codex-pets/expertbo-preview.png` and `shadowbo-preview.png`.
- Confirmed `expertbo-preview.png` is the existing Bo figure to use as the main avatar.
- Replaced the CSS-made fake Bo character with existing ExpertBo/ShadowBo images.
- Added chapter-based RPG story events, route scores, flags, route-dependent choices, and a final route-ending calculation.
- Added a side-panel RPG route tracker for business, trust, boundary, and shadow routes.
- Added local-dev image fallback while keeping `sitePath` as the primary production asset path.

## Iteration Log

- N/A.

## Deferred Verification

- N/A.

## Decisions and Assumptions

- Use `sitePath('/codex-pets/expertbo-preview.png')` for the main Bo character and reserve ShadowBo as a branch/flavor asset.
- Keep the static Astro/localStorage architecture while enriching RPG mechanics in the browser script.
- Route choices are still mapped to the four existing actions, but their labels and branch effects now change by story node.

## Files Touched

- `.agents/tasks/active/2026-06-22-yuanbo-game-rpg-rework.md`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- Browser check: ExpertBo image loads locally with natural width 252; ShadowBo image loads with natural width 192.
- Browser check: fake CSS head/body character is gone; existing Bo images are used.
- Browser check: RPG panel exists and displays chapter/arc and four route meters.
- Browser interaction: choosing `企业版报价` advanced to the GPU branch, updated action labels, and increased the business route score.
- Browser mobile check at 390x844: ExpertBo loads, RPG panel exists, action buttons remain in the first viewport, no horizontal overflow, no console errors.
- `pnpm -C apps/frontend-astro build`: passed; generated `/bo/yuanbo-game/index.html`.
- `pnpm agent:lint`: passed with warnings from pre-existing unrelated active miniapp/doc worktree state (`multiple-active-tasks`, missing Mode in `.agents/tasks/active/2026-06-22-miniapp-photo-browser-polish.md`, agent docs changed without AGENTS.md changing).

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-22-yuanbo-game-rpg-rework.md`
