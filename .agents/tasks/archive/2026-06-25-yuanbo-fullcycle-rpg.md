# Task Record: yuanbo full-cycle RPG tuning

- State: active
- Mode: full
- Started: 2026-06-25
- Branch: codex/tmp-yuanbo-fullcycle
- Request: Make Yuanbo RPG playable across early, mid, late, boss, and postgame instead of only tweaking starter difficulty.

## Acceptance Boundaries

- Functional: Add staged progression rules, tutorial protection, clearer negotiation feedback, management predictions, Boss phase pressure, and postgame growth persistence.
- Verification: Build Astro, run agent lint, browser-check PC/mobile core flows, and validate save import/export basics.
- Docs Sync: Keep task record evidence; no architecture docs unless commands or contracts change.
- Safety: Work in clean temp worktree and ignore unrelated dirty files in the main checkout.
- Archive: Move this record to `.agents/tasks/archive/` after verification.

## Actions

- Created clean temp worktree from `origin/main` for isolated implementation.
- Added progression phase types, save defaults, and phase rule data.
- Reworked customer data with risk profiles, teaching hints, recommended plans, and easier first-two tutorial stats.
- Wired negotiation startup, client actions, outcome thresholds, issue severity, rewards, Boss stage prompts, and postgame level to phase rules.
- Added quest brief, task board, field operation, training, skill loadout, and battle UI feedback for phase, risk, predicted effects, intent, danger, and skill purpose.

## Iteration Log

- N/A

## Deferred Verification

- Browser PC/mobile verification after implementation.

## Decisions and Assumptions

- Keep Phaser and current route, but make Phaser systems carry the game loop.
- Keep v3 save key and normalize new fields with defaults so local saves do not crash.

## Files Touched

- `.agents/tasks/active/2026-06-25-yuanbo-fullcycle-rpg.md`
- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed. Sentry auth/chunk-size warnings only.
- `pnpm agent:lint`: passed.
- Browser PC 1280x800: first screen renders Phaser map, Bo protagonist, NPCs and hotspots; first quest brief shows phase/risk/recommended plan; first negotiation shows dynamic target, intent, danger, skill tags; first GPU battle wins with next-step advice and no console errors.
- Browser mobile 390x844: map has no horizontal overflow, touch joystick/interact/menu visible; mobile menu opens via DOM button; import/export UI opens and accepts save code; second quest brief and negotiation fit viewport without overflow; no console errors.
- Boss flow: imported late-game save, Boss unlocked on client-site map, Boss brief shows joint acceptance phase and legacy issue context, Boss battle logs budget trial and docket material, high-build Boss clear advances to next cycle with long-term growth retained.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-25-yuanbo-fullcycle-rpg.md`
