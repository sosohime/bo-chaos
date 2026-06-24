# Task Record: Yuanbo mobile fit

- State: active
- Mode: visual-fast-lane
- Started: 2026-06-23
- Branch: codex/miniapp-tech-refactor
- Request: Fix mobile adaptation for the Yuanbo Phaser RPG page.

## Acceptance Boundaries

- Functional: Mobile must not distort the Phaser canvas or overlap the HUD with outer navigation.
- Verification: Browser check at a narrow portrait viewport and Astro build before final.
- Docs Sync: Run `pnpm agent:lint` before final; no docs changes expected.
- Safety: Local frontend only.
- Archive: Move record to archive when complete.

## Actions

- User supplied a mobile screenshot showing stretched text, overlapped top HUD, and incorrect portrait adaptation.
- Changed game startup to create a portrait Phaser canvas on narrow mobile viewports instead of stretching a 16:9 canvas.
- Added portrait camera follow so the 960px-wide map can be navigated inside a 390px viewport.
- Reworked mobile HUD spacing to avoid overlap with the fixed back link.
- Reworked dialogs/toasts to use viewport dimensions and fixed scroll factor.
- Removed CSS distortion by matching canvas dimensions to the mobile game size.

## Iteration Log

- Current target route: `http://localhost:4321/bo/yuanbo-game`.
- Target viewport: portrait mobile around 390px wide.

## Deferred Verification

- Pending after code changes.

## Decisions and Assumptions

- Fix actual game/canvas sizing instead of stretching the 16:9 canvas with CSS.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- Browser 390x844: canvas rendered as 390x844 with no horizontal overflow, touch bridge visible, no console errors.
- Browser desktop follow-up was attempted, but the browser plugin navigation timed out; desktop logic remains on the unchanged 960x540 game size path.
- `pnpm agent:lint`: exited 0 with pre-existing unrelated warnings.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-mobile-fit.md`
