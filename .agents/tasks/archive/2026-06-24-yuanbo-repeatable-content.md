# Task Record: Yuanbo Repeatable Content Systems

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: current worktree
- Request: Continue toward a 5MB-quality Yuanbo management RPG with stronger story and growth motivation.

## Acceptance Boundaries

- Functional: Add repeatable gameplay content systems, not filler text only. Target customer variants, weekly goals, route mastery, and rewards that affect future runs.
- Verification: Run Astro build, agent lint, browser checks for desktop/mobile, and subagent CR when meaningful.
- Docs Sync: No docs updates unless commands, routing, or agent instructions change.
- Safety: Local Astro game only; no backend, production writes, secrets, or destructive git operations.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Confirmed routing to `apps/frontend-astro/src/game/yuanbo/`.
- Inspected current game data/state/types and measured source content size.
- Added weekly goals, case variants, and claimed reward tracking to make repeat runs vary by route, quest, failures, and training.
- Generated transparent Bo pet cutout assets from the existing ExpertBo/ShadowBo images and switched the Astro page/game defaults to those assets.
- Replaced the map player with the original Bo pet cutout at preserved aspect ratio, raised movement speed, and removed the white portrait-frame effect from negotiation/result Bo cards.
- Ran mobile and desktop browser checks with a temporary isolated localStorage state.

## Decisions and Assumptions

- The user wants more story and growth depth. This pass should add reusable systems and content volume that changes decisions.
- The game still uses browser localStorage and Phaser inside Astro.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/public/codex-pets/expertbo-cutout.png`
- `apps/frontend-astro/public/codex-pets/shadowbo-cutout.png`

## Verification Evidence

- `pnpm -C apps/frontend-astro build` passed. Yuanbo game client bundle reported `1,554.46 kB` minified, `372.81 kB` gzip.
- Playwright/Chrome QA passed for `390x844` mobile and `1280x800` desktop: no console/page errors and no horizontal overflow.
- Mobile screenshots checked:
  - `/tmp/yuanbo-mobile-map.png`: original Bo pet cutout appears on map without white block.
  - `/tmp/yuanbo-mobile-battle.png`: negotiation Bo card uses transparent cutout, no large white square.
- `pnpm agent:lint` exited 0 with warnings for existing/mixed task records and docs sync hints; no blocking lint failure.

## Handoff / Archive Notes

- Final state: archived after this pass. The game is improved but still not at the user's requested full "5MB-quality" depth.
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-repeatable-content.md`
