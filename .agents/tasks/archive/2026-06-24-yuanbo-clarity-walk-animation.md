# Task Record: Yuanbo Clarity And Walk Animation

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: codex/yuanbo-game-rpg-polish
- Request: Improve blurry game rendering and add an animated walking Bo character using the provided Bo source image.

## Acceptance Boundaries

- Functional: Game canvas renders at high-DPI resolution; Bo uses a transparent walking sprite sheet with visible arm/leg movement while moving.
- Verification: Build Astro, run agent lint, browser-check canvas resolution and map movement/animation visually.
- Docs Sync: No docs update required for this game asset/rendering fix.
- Safety: Do not touch unrelated miniapp and agent-doc dirty files.
- Archive: Move this record to `.agents/tasks/archive/` after verification.

## Actions

- Generated a Bo RPG walking sprite sheet concept from the provided reference image using the built-in image generation tool.
- Processed the generated sheet into a transparent 3x4 Phaser spritesheet asset.
- Added the spritesheet as a project asset at `apps/frontend-astro/public/codex-pets/yuanbo-walk-sprite-v1.png`.
- Wired the game page to pass the walking spritesheet URL into Phaser.
- Changed the map player from a static Arcade Image to an Arcade Sprite with four-direction walking animations.
- Set Phaser Text styles to render at the current device pixel ratio to improve text clarity on high-DPI displays.

## Files Touched

- `apps/frontend-astro/public/codex-pets/yuanbo-walk-sprite-v1.png`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- In-app browser `/bo/yuanbo-game`: confirmed `data-bo-walk-src` resolves to `/codex-pets/yuanbo-walk-sprite-v1.png`.
- In-app browser movement check: pressing `D` changes Bo to the side-walk animation frame with visible arm/leg movement.
- In-app browser render check: device pixel ratio is 2, and Phaser text styles now request DPR-based text texture resolution.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed with pre-existing unrelated warnings for another active miniapp task and changed agent docs; this task's temporary active-task warning will clear after archive.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-clarity-walk-animation.md`
