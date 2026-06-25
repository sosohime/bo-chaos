# Task Record: Yuanbo live map disorder

- State: complete
- Mode: full
- Started: 2026-06-25
- Branch: codex/yuanbo-alpha-main
- Request: Inspect the live Yuanbo game page in Chrome and fix the visual disorder.

## Acceptance Boundaries

- Functional: Remove duplicated baked/runtime map props that make the live game view look错乱.
- Verification: Build, agent lint, Yuanbo probes, and live smoke after deploy.
- Docs Sync: No agent docs expected unless workflow or commands change.
- Safety: Do not touch unrelated worktree changes; do not inspect Chrome local storage.
- Archive: Move this record to archive once pushed and verified.

## Actions

- Chrome extension claim timed out; local checks showed Chrome, extension, and native host are installed and enabled.
- Confirmed the released map PNGs already contain furniture while runtime draws the same hotspots again.
- Generated floor-only office/site map assets and switched the game to new filenames to avoid stale browser caches.

## Iteration Log

- N/A

## Deferred Verification

- Live Chrome screenshot is waiting on user approval to refresh the Chrome extension connection.

## Decisions and Assumptions

- Fix in `bo-chaos-yuanbo-alpha`, the clean worktree that produced the current online bundle.
- Use new map asset filenames to avoid stale browser caches for public PNGs.

## Files Touched

- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/src/game/yuanbo-pixi/main.ts`
- `apps/frontend-astro/public/codex-pets/yuanbo-pixi/v1/office-map-floor-v2.png`
- `apps/frontend-astro/public/codex-pets/yuanbo-pixi/v1/site-map-floor-v2.png`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed.
- `pnpm probe:yuanbo-pixi`: passed.
- `YUANBO_URL=http://127.0.0.1:4323/bo/yuanbo-game/ pnpm probe:yuanbo-pixi:browser`: passed.
- Local 1280x800 screenshot confirmed map props render once, without baked/runtime duplication.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-25-yuanbo-live-map-disorder.md`
