# Task Record: yuanbo playable alpha rebuild

- State: active
- Mode: full
- Started: 2026-06-25
- Branch: codex/yuanbo-alpha-main
- Request: Rebuild Yuanbo after-sales game into a playable PixiJS management RPG alpha.

## Acceptance Boundaries

- Functional: playable map, battle, training, debt, 8 normal customers, 3-phase boss, v2 local save.
- Verification: Astro build, agent lint, simulation probe, browser probe, desktop/mobile screenshots.
- Docs Sync: no agent doc workflow changes expected.
- Safety: no backend, no production data writes, browser validation only local until push.
- Archive: move this record to archive before final response.

## Actions

- Created generated project assets under `apps/frontend-astro/public/codex-pets/yuanbo-pixi/v1/`.
- Upgraded save schema to v2 with battle persistence, XP, level, equipped skills, typed issues.
- Added 8 normal customer content, typed售后债, debt clearing action, and 3-phase Boss logic.
- Reworked Pixi movement to retained map/player updates with throttled localStorage writes.
- Reworked battle skill deck to recommend by risk/phase and page through all unlocked skills.
- Improved mobile battle layout for 390x844 and 390x640.

## Iteration Log

- User rejected placeholder/block-like assets and shallow gameplay; plan implemented as playable alpha slice.

## Deferred Verification

- Live production smoke waits until push and GitHub Actions deploy.

## Decisions and Assumptions

- Keep PixiJS v8 and Astro route.
- Do not migrate v1 localStorage automatically; v2 save key is clean.
- Use `source-image2-green.png` as the clean Bo pet source for derived game assets.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo-pixi/*`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/public/codex-pets/yuanbo-pixi/v1/*`
- `scripts/yuanbo-pixi-*.mjs`

## Verification Evidence

- `pnpm probe:yuanbo-pixi`: passed.
- `pnpm probe:yuanbo-pixi:browser`: passed locally.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-25-yuanbo-playable-alpha-rebuild.md`
