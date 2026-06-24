# Task Record: yuanbo game polished ui

- State: active
- Mode: full
- Started: 2026-06-22
- Branch: codex/miniapp-tech-refactor
- Request: Polish 袁博の极限售后 by moving save migration out of the flat page, adding animation, and adding a Bo character.

## Acceptance Boundaries

- Functional: Save migration is no longer flat on the main page; the game has a visible Bo character, refined stage UI, and animation/feedback.
- Verification: Browser-check current localhost route, run `pnpm -C apps/frontend-astro build`, and run `pnpm agent:lint`.
- Docs Sync: Agent docs are unaffected unless architecture, commands, routing, data models, or workflow rules change.
- Safety: No backend, production writes, schema changes, deploys, pushes, or secrets handling.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Started from user feedback that the current UI was rough, save migration was improperly flat, and the game lacked animation and a Bo avatar.
- Routed the work to `apps/frontend-astro` only.
- Moved save migration from a flat side-panel section into a `dialog` opened by a top-bar save button.
- Added a CSS/HTML Bo character with idle breathing, blinking, waving console animation, result reaction animation, and result-dependent speech.
- Added result-card pop animation and action-button active micro-interactions.
- Tuned mobile layout so Bo remains visible in a compact side stage without pushing action buttons below the first screen.

## Iteration Log

- N/A.

## Deferred Verification

- N/A.

## Decisions and Assumptions

- Keep the current localStorage save/import/export mechanics, but move them behind a dialog so the main screen feels like a game.
- Add CSS-driven character and UI animations without introducing new dependencies.

## Files Touched

- `.agents/tasks/active/2026-06-22-yuanbo-game-polished-ui.md`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- Browser check: main page no longer contains `aside .ybg-save`; save trigger and dialog exist.
- Browser check: save dialog opens/closes, export generates a `YBG1:` migration code.
- Browser check: Bo character renders and receives result-dependent tone/speech; clicking a strategy adds Bo/result animation classes and advances the day.
- Browser check at 390x844: Bo remains visible, action buttons are visible in the first viewport, no horizontal overflow, no console errors.
- `pnpm -C apps/frontend-astro build`: passed; generated `/bo/yuanbo-game/index.html`.
- `pnpm agent:lint`: passed with warnings from pre-existing unrelated active miniapp/doc worktree state (`multiple-active-tasks`, missing Mode in `.agents/tasks/active/2026-06-22-miniapp-photo-browser-polish.md`, agent docs changed without AGENTS.md changing).

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-22-yuanbo-game-polished-ui.md`
