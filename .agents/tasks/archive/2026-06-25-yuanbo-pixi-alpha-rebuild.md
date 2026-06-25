# Task Record: yuanbo pixi alpha rebuild

- State: active
- Mode: full
- Started: 2026-06-25
- Branch: codex/yuanbo-alpha-main
- Request: Rebuild 《袁博の极限售后》 from the Phaser prototype into a PixiJS v8 15-minute public Alpha with clear gameplay, story, UI, assets, probes, and online deployment.

## Acceptance Boundaries

- Functional: PixiJS v8 replaces the Phaser game body; one cycle runs from opening to Boss settlement; no deadlocks, placeholders, text overflow, or component overflow; Bo assets are not cropped; PC and mobile are playable; save export/import/refresh works.
- Verification: Run Pixi probe, Astro build, agent lint, browser black-box checks for PC/mobile, and deployment confirmation.
- Docs Sync: Update command docs if scripts change.
- Safety: Work in clean main worktree; do not touch unrelated dirty changes in the original workspace.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Started from clean `bo-chaos-yuanbo-alpha` worktree at `origin/main`.
- Confirmed current game page still imports Phaser implementation and existing game body is a large single-file Phaser implementation.
- Added PixiJS v8 dependency for `apps/frontend-astro`.
- Added Pixi runtime, game data, save state, negotiation simulator, and deterministic Alpha probe.
- Switched `/bo/yuanbo-game` to mount the Pixi runtime instead of the Phaser prototype.
- Added root `probe:yuanbo-pixi` and `probe:yuanbo-pixi:browser` commands and documented them in agent command docs.

## Iteration Log

- Logic probe initially failed early and mid campaign; fixed mismatch between story objectives and generic battle win conditions.
- Added quest-specific win/partial checks, post-battle recovery, true action-point spending in simulation, and Boss-specific recommended strategy.
- Updated the campaign probe to use the real rest/training day loop instead of manually refilling action points.
- Browser probe initially caught a fast-click modal guard and mobile battle touch-control obstruction; adjusted probe timing and hid mobile touch controls in battle scenes.
- Visual screenshot review caught mobile HUD overlap, player name covering Bo's face, and battle copy/portrait collisions; adjusted responsive layout.

## Deferred Verification

- Deployment confirmation after push.

## Decisions and Assumptions

- Use PixiJS v8 for the game runtime.
- Keep old Phaser files as reference for now; switch the page entry to Pixi.
- Use existing Bo walk/portrait assets as the source of truth for Bo likeness.
- Build a clear 15-minute Alpha, not a full long-form game.

## Files Touched

- `.agents/tasks/active/2026-06-25-yuanbo-pixi-alpha-rebuild.md`
- `AGENTS.md`
- `docs/agent/COMMANDS.md`
- `package.json`
- `pnpm-lock.yaml`
- `apps/frontend-astro/package.json`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/src/game/yuanbo-pixi/*`
- `scripts/yuanbo-pixi-probe.mjs`
- `scripts/yuanbo-pixi-browser-probe.mjs`

## Verification Evidence

- `pnpm probe:yuanbo-pixi` passed. It verifies all 6 customers plus Boss can resolve and a full campaign reaches Boss win/ending.
- `pnpm probe:yuanbo-pixi:browser` passed against `http://localhost:4321/bo/yuanbo-game/`. It verifies PC/mobile canvas sizing, no page overflow, keyboard movement, NPC-to-battle transition, and mobile battle layout.
- `pnpm -C apps/frontend-astro build` passed.
- `pnpm agent:lint` passed.
- Local screenshots reviewed for desktop map, mobile map, and mobile battle after responsive fixes.

## Handoff / Archive Notes

- Final state: ready to push
- Archive path: `.agents/tasks/archive/2026-06-25-yuanbo-pixi-alpha-rebuild.md`
