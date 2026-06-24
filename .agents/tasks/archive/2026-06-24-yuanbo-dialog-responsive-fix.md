# Task Record: Yuanbo Dialog Responsive Fix

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: codex/yuanbo-game-rpg-polish
- Request: Fix normal web-window UI overflow where dialog text and buttons spill outside their Phaser panels.

## Acceptance Boundaries

- Functional: Desktop web dialogs and buttons keep text inside their panels; long Chinese copy and multi-line button labels wrap or shrink safely.
- Verification: Astro build, agent lint, browser check at normal desktop size and mobile size.
- Safety: Do not touch unrelated miniapp/docs dirty files.
- Archive: Move this record to `.agents/tasks/archive/` after verification.

## Actions

- Added manual CJK wrapping for desktop modal body copy instead of relying only on Phaser wordWrap.
- Added button text fit logic for world modal buttons and negotiation scene buttons.
- Kept the previous left/right Bo direction fix in the same source file because it was already part of the active game polish.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed after archive with pre-existing unrelated warnings for `.agents/tasks/active/2026-06-22-miniapp-photo-browser-polish.md` and agent docs TOC.
- Browser 1280x720: game canvas has no horizontal document overflow; menu dialog buttons stay inside panel.
- Browser 900x650: menu dialog and long `售后案卷` dialog text/buttons stay inside panel; no console errors.
- Browser 390x844: game canvas has no horizontal document overflow; no console errors on reload.
