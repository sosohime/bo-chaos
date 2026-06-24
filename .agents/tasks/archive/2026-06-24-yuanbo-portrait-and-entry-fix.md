# Task Record: Yuanbo Portrait And Entry Fix

- State: archived
- Mode: full
- Started: 2026-06-24
- Branch: codex/tmp-main-push
- Request: Fix the remaining cropped Bo portraits in dialogs, remove the in-game back link, and make the Bo homepage game entry open in a new tab.

## Acceptance Boundaries

- Functional: Map Bo and dialog/negotiation/result Bo images all come from the provided `source-image2-green.png` source-derived assets; the game page has no top-left return link; the Bo homepage game entry opens in a new tab.
- Verification: Astro build, agent lint, browser DOM checks, and screenshot inspection.
- Safety: Avoid unrelated miniapp/docs dirty files in the user's primary worktree.

## Actions

- Added `yuanbo-source2-portraits-v1.png`, extracted from `packages/codex-pets/pets/expertbo/source-image2-green.png` using ImageMagick.
- Loaded the portrait sheet in Phaser and changed `addBoPhoto()` to render mood-specific frames instead of old cutout textures.
- Removed the fixed `.yrpg-back` link from the game page.
- Added `target="_blank"` and `rel="noreferrer"` to the Bo homepage Yuanbo game entry.

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed.
- Browser DOM check: home entry `target="_blank"`, game page has no `.yrpg-back`, and game root has `data-bo-portraits-src="/codex-pets/yuanbo-source2-portraits-v1.png"`.
- Browser screenshot `/tmp/yuanbo-basic-fix-audit-2/02-negotiation-new-portrait.png`: negotiation portrait uses the source-derived Bo frame and is not cropped or squashed.
