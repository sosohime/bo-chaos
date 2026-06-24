# Task Record: Yuanbo Entry And Bo Crop

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: codex/yuanbo-game-rpg-polish
- Request: Confirm the Yuanbo game homepage entry and fix the broken cropped Bo character in the map.

## Acceptance Boundaries

- Functional: Bo homepage has a visible entry to the game; the map player uses the original ExpertBo cutout rather than the narrow cropped map image.
- Verification: Browser-check the homepage entry and game character, run Astro build and agent lint.
- Docs Sync: No docs update required for this narrow Astro/game fix.
- Safety: Do not touch unrelated miniapp and agent-doc dirty files.
- Archive: Move this record to `.agents/tasks/archive/` after verification.

## Actions

- Confirmed the Bo homepage includes a `袁博の极限售后` entry in the `整活` section.
- Switched the game page map Bo asset from `expertbo-map-cutout.png` to the original `expertbo-cutout.png`.
- Updated the game fallback map Bo asset to the original ExpertBo cutout.
- Increased the map player display width so the full body and arms are visible at game scale.

## Decisions and Assumptions

- The map player should use the original `expertbo-cutout.png` so the full body and arms remain visible.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- In-app browser `/bo`: DOM contains the `袁博の极限售后` entry and `/bo/yuanbo-game` href.
- In-app browser `/bo/yuanbo-game`: `data-map-bo-src` and `data-bo-src` both resolve to `/codex-pets/expertbo-cutout.png`; visual screenshot shows full-width Bo instead of the narrow cropped map image.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed with pre-existing unrelated warnings for another active miniapp task and changed agent docs; this task's temporary active-task warning will clear after archive.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-entry-bo-crop.md`
