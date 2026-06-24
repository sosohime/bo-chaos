# Task Record: Yuanbo Real Bo Walk

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: codex/yuanbo-game-rpg-polish
- Request: Stop using the bad generated Bo walking sprites and use the provided Bo pet source sheet at `packages/codex-pets/pets/expertbo/source-image2-green.png`.

## Acceptance Boundaries

- Functional: Remove the unlike-Bo generated walking spritesheet from the playable character path; map Bo uses the provided ExpertBo pet source sheet, animates side-walk frames while moving, and returns to the normal front idle pose when stopped.
- Verification: Build Astro, browser-check idle and movement, run agent lint.
- Docs Sync: No docs update required for this narrow game fix.
- Safety: Do not touch unrelated miniapp and agent-doc dirty files.
- Archive: Move this record to `.agents/tasks/archive/` after verification.

## Actions

- Removed the unlike-Bo generated walking spritesheet from the game page and playable character path.
- Deleted `apps/frontend-astro/public/codex-pets/yuanbo-walk-sprite-v1.png`.
- Extracted a 3-column, 4-row Phaser spritesheet from `packages/codex-pets/pets/expertbo/source-image2-green.png` into `apps/frontend-astro/public/codex-pets/yuanbo-source2-walk-v1.png`.
- Wired `data-bo-walk-src` and Phaser fallback loading to `/codex-pets/yuanbo-source2-walk-v1.png`.
- Set idle and stop states to the provided source sheet's normal front idle frame.
- Confirmed the source sheet has front and side-walk frames but no rear-view frames; up movement currently uses the front-facing fallback row.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/public/codex-pets/yuanbo-walk-sprite-v1.png`
- `apps/frontend-astro/public/codex-pets/yuanbo-source2-walk-v1.png`

## Verification Evidence

- In-app browser `/bo/yuanbo-game`: idle screenshot shows the provided source-sheet Bo standing pose, no white block, no badge number.
- In-app browser desktop check: `data-bo-walk-src` resolves to `/codex-pets/yuanbo-source2-walk-v1.png`; canvas renders at 1280x720 CSS with no console errors.
- In-app browser movement check: pressing `D` moves Bo without head/foot frame corruption, then returns to the front idle frame.
- In-app browser mobile check at 390x844: no horizontal overflow; joystick drag moves Bo without console errors.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed with pre-existing unrelated warnings for `.agents/tasks/active/2026-06-22-miniapp-photo-browser-polish.md` and agent docs TOC.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-real-bo-walk.md`
