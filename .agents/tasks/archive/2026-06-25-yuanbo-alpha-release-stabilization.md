# Task Record: yuanbo alpha release stabilization

- State: complete
- Mode: full
- Started: 2026-06-25
- Branch: codex/yuanbo-game-rpg-polish
- Request: Stabilize 《袁博の极限售后》 into a 15-minute playable public Alpha with no deadlocks, usable PC/mobile UI, correct Bo assets, progression gradient, automated probes, agent playtests, and push to main.

## Acceptance Boundaries

- Functional: One full run from opening through Boss settlement is playable; every negotiation has a deterministic exit; early game is forgiving, mid/late game has pressure; Bo map/dialog/negotiation assets are not cropped or directionally broken; PC/mobile UI is readable and non-overflowing; save export/import/refresh works; Bo homepage opens the game in a new tab.
- Verification: Run focused probe script, Astro build, agent lint, PC browser check, mobile browser check, and 3 agent playtest reviews.
- Docs Sync: Agent docs are unaffected unless commands or architecture guidance changes.
- Safety: Do not touch unrelated dirty miniapp/docs changes; do not write production data; push only after verification.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Started from current worktree and confirmed unrelated miniapp/docs changes already exist.
- Confirmed target area is `apps/frontend-astro` Yuanbo Phaser game and Bo page entry.
- Generated clean `source-image2-green`-based Bo walk and portrait sheets under Astro public assets.
- Rewired Phaser to use the new 128x160 Bo frames, fixed left/right walking frames, increased movement speed, and stopped browser upscaling on PC.
- Added a battle fallback action and probe script so all negotiations settle instead of deadlocking when skills are exhausted.
- Tuned first-act customer stats and SLA boundary skill to make early game forgiving while preserving mid/late pressure.
- Added `/retire/bo` and `/retire/bo/yuanbo-game` route aliases so the public prefixed URL is directly reachable.
- Fixed the task board P0 caused by a malformed `showDialog()` call.
- Resolved 3-agent review P1s: mobile HUD density, mobile interact label, first-minute NPC priority, and Boss unlock mismatch.

## Iteration Log

- N/A.

## Deferred Verification

- Browser and agent playtest verification after implementation.

## Decisions and Assumptions

- Use current local game code as authoritative for implementation.
- Keep scope to Astro game, assets, scripts, and task record unless verification requires otherwise.

## Files Touched

- `.agents/tasks/active/2026-06-25-yuanbo-alpha-release-stabilization.md`
- `AGENTS.md`
- `docs/agent/COMMANDS.md`
- `package.json`
- `scripts/yuanbo-probe.mjs`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/src/pages/retire/bo.astro`
- `apps/frontend-astro/src/pages/retire/bo/yuanbo-game.astro`
- `apps/frontend-astro/public/codex-pets/yuanbo-source2-walk-v2.png`
- `apps/frontend-astro/public/codex-pets/yuanbo-source2-portraits-v2.png`

## Verification Evidence

- `pnpm probe:yuanbo`: passed; all quests and campaign settle, including `campaign recommended -> boss completed`.
- `pnpm -C apps/frontend-astro build`: passed; generated `/bo/*` and `/retire/bo/*` pages.
- `pnpm agent:lint`: passed after syncing command docs and AGENTS.
- Browser mobile `390x844`: Bo sprite visible from source asset, task board opens with no console errors, menu opens, import overlay shows textarea/buttons, first battle settles back to map.
- Browser PC `1280x800`: canvas is no longer browser-upscaled (`960x540` physical and CSS), map remains readable.
- 3 subagents reviewed game/UI/stability; their P0/P1 findings were addressed.
- Clean `origin/main` worktree verification: `pnpm probe:yuanbo`, `pnpm -C apps/frontend-astro build`, and `pnpm agent:lint` passed; `/retire/bo/yuanbo-game` returned 200 on local dev server.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-25-yuanbo-alpha-release-stabilization.md`
