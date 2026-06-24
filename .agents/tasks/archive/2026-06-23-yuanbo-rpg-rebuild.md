# Task Record: Yuanbo management RPG rebuild

- State: active
- Mode: full
- Started: 2026-06-23
- Branch: codex/miniapp-tech-refactor
- Request: Rebuild the Yuanbo game into a Phaser-led management web RPG rather than patching the old DOM prototype.

## Acceptance Boundaries

- Functional: Phaser owns the main game experience: walking maps, NPC interaction, dialog, negotiation, HUD, growth, training, issues, Boss, and local save migration.
- Verification: Build, agent lint, and browser checks for desktop/mobile gameplay and overflow.
- Docs Sync: Run `pnpm agent:lint`; no broader docs expected unless paths or workflows change.
- Safety: No backend, production, auth, or external writes.
- Archive: Move this record to archive when complete.

## Actions

- Routed to `apps/frontend-astro` via bo-chaos task routing.
- Rebuilding the existing Yuanbo prototype as a Phaser-first v3 game.
- Replaced the DOM-card prototype with a Phaser-first shell and canvas game.
- Added v3 state, save import/export, action points, training, issues, routes, customer pressure, Boss unlock, and cycle reset.
- Added walking maps, pixel Bo character frames, NPCs, hotspots, task brief dialogs, training board, menu, and negotiation scene.
- Added mobile touch bridge for movement/interact while keeping core gameplay inside Phaser.

## Iteration Log

- User rejected repair-style UI and requested implementation of the full rebuild plan.

## Deferred Verification

- Browser gameplay and responsive checks after implementation.

## Decisions and Assumptions

- Keep Phaser and Astro route.
- Do not migrate v2 save data; use v3 storage.
- Use existing ExpertBo/ShadowBo portraits as visual references and in-game portrait assets.

## Files Touched

- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/game/yuanbo/types.ts`
- Removed old prototype files `MapScene.ts` and `textures.ts`.

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed with pre-existing warnings about unrelated active task/doc sync checks.
- Browser desktop 1280x800: canvas 1280x720, no horizontal overflow, touch bridge hidden.
- Browser mobile 390x844: canvas 390x844, no horizontal overflow, touch bridge visible with ↑/←/↓/→/互动.
- Browser gameplay: moved Bo near NPC, opened quest brief, entered negotiation scene.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-rpg-rebuild.md`
