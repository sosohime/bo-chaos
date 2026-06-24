# Task Record: yuanbo premium management rpg

- State: complete
- Mode: full
- Started: 2026-06-23
- Branch: codex/miniapp-tech-refactor
- Request: Implement the approved plan for a higher-quality pixel management web RPG for 袁博の极限售后.

## Acceptance Boundaries

- Functional: Replace the current placeholder Phaser prototype with a pixel management RPG slice: 2 maps, 6 customers, 1 Boss, map exploration, turn-based negotiation, training, progression, save/export/import.
- Visual: Remove circle NPCs and point-like player. Use dedicated pixel-style player/NPC/tile assets or deterministic pixel textures.
- Architecture: Keep Astro host page but move Phaser game logic and data under `apps/frontend-astro/src/game/yuanbo/`.
- Verification: Build Astro app, browser-check local route, verify desktop/mobile layout and core gameplay, run `pnpm agent:lint`.
- Safety: No backend, schema, production writes, deploys, pushes, secrets, or paid operations.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Started implementation after user approved the plan.
- Replaced the single-file Phaser prototype with an Astro host page plus modular game code under `apps/frontend-astro/src/game/yuanbo/`.
- Added deterministic pixel-art texture generation for Bo 4-direction movement, six customer NPCs, one Boss NPC, floor tiles, portals, and office/customer-site furniture.
- Implemented two maps: cloud售后 office and client-site, with map switching, obstacles, NPC visibility/unlocks, and mobile controls.
- Implemented six ordinary customer quests plus a Boss quest, task board states, level recommendations, rewards, retryable failures, and Boss unlock after four ordinary completions.
- Implemented turn-based negotiation with 8 skills, cooldowns, resource costs, client counter-moves, win/partial/fail outcomes, rewards, route growth, and week/cycle ending.
- Implemented management loop: two actions per day, customer handling, training lines, next-day recovery, local save/export/import/reset.
- Restarted Astro dev server after stale markup was detected during browser verification.

## Iteration Log

- Build passed after the modular rewrite.
- Browser initially served stale markup from the old route; restarted Astro dev server.
- Browser verified map-to-brief-to-battle flow and a partial success result.
- Final storage key was bumped after browser testing so the user sees a clean new-game start.

## Deferred Verification

- N/A.

## Decisions and Assumptions

- Use deterministic pixel-art textures and SVG reference assets committed to the Astro app rather than relying on uncontrolled generated bitmap output.
- Keep Phaser 3 and browser-local persistence.
- Keep PC primary, mobile playable.
- Keep generated pixel assets in Phaser texture code for deterministic repeatability; future bitmap sprite sheets can replace these keys without changing gameplay data.

## Files Touched

- `.agents/tasks/active/2026-06-23-yuanbo-premium-management-rpg.md`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/game/yuanbo/textures.ts`
- `apps/frontend-astro/src/game/yuanbo/MapScene.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro build` passed after implementation and after final storage-key bump.
- Browser route check after Astro restart: canvas renders, `0 / 6` progress, 3 office customers, 5 training buttons, no console errors.
- Browser gameplay check: moved to a customer, opened negotiation, verified 8 skills with level locks, ran a negotiation to `部分成功`, progress became `1 / 6`, cash/actions/log updated.
- Browser responsive checks: desktop 1280x800 rendered two-column layout with canvas 760x507 and no overflow; mobile 390x844 rendered canvas 341x227, mobile pad displayed, no overflow.
- Final browser clean-start check after storage-key bump: canvas renders, office map, `0 / 6`, `¥180`, 3 initial quests, no console errors.
- `pnpm agent:lint` exited 0. Remaining warnings are unrelated existing active task/docs state and command-doc sync warning from package/config changes.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-premium-management-rpg.md`
