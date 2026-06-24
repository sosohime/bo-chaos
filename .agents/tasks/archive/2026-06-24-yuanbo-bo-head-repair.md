# Task Record: Yuanbo Bo Head Repair

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: codex/yuanbo-game-rpg-polish
- Request: Fix the Bo map character after badge removal clipped part of the head.

## Acceptance Boundaries

- Functional: Remove the desktop-pet badge without leaving a missing head/hair area, while preserving the full-width arms from the original ExpertBo image.
- Verification: Build Astro and visually verify the game map in the in-app browser.
- Docs Sync: No docs update required for this narrow game image-composition fix.
- Safety: Do not touch unrelated miniapp and agent-doc dirty files.
- Archive: Move this record to `.agents/tasks/archive/` after verification.

## Actions

- Added a head-patch asset path for the existing no-badge ExpertBo map cutout.
- Kept the full original ExpertBo image as the map body source so arms stay intact.
- Generated the in-game map cutout by removing the badge and drawing the no-badge patch back over the head/body area.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- In-app browser `/bo/yuanbo-game`: visual screenshot shows the badge is gone, the head/hair is no longer clipped, and the arms remain visible.
- Browser runtime attributes: `data-map-bo-src` remains `/codex-pets/expertbo-cutout.png`; `data-bo-head-patch-src` is `/codex-pets/expertbo-map-cutout.png`.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed with pre-existing unrelated warnings for another active miniapp task and changed agent docs; this task's temporary active-task warning will clear after archive.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-bo-head-repair.md`
