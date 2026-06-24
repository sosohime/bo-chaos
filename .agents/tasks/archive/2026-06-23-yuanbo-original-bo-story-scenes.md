# Task Record: Yuanbo original Bo story scenes

- State: complete
- Mode: full
- Started: 2026-06-23
- Branch: codex/miniapp-tech-refactor
- Request: Use the original Bo image directly, clarify story additions, and show Bo differently across game scenes.

## Acceptance Boundaries

- Functional: Map player uses the original Bo pet image; first-entry story is visible; negotiation and result scenes use original Bo art with distinct states.
- Verification: Astro build, browser mobile screenshot, agent lint.
- Docs Sync: No product docs expected; task record only.
- Safety: Local Astro frontend only.
- Archive: Move record to archive when complete.

## Actions

- Routed work to `apps/frontend-astro` Yuanbo game.
- Swapped map player from generated pixel Bo textures to the original `expertbo-preview.png` image.
- Added first-entry story intro dialog for the after-sales billing joke premise.
- Added `storyIntroSeen` save-state support so old saves normalize safely and new saves do not replay the intro every map redraw.
- Added reusable original-Bo photo state cards for talk, win, fail, shock, and shadow contexts.
- Updated negotiation and result scenes to use original Bo art state cards instead of generated Bo sprites as the main visual.

## Iteration Log

- User rejected the map pixel sprite and requested direct original Bo usage plus clearer story and scene images.

## Deferred Verification

- None.

## Decisions and Assumptions

- Keep generated pixel sprite textures available for small accents, but do not use them as the main map Bo character.
- The original image has a white square/background baked in; it is intentionally shown because the user asked for the raw original Bo.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/game/yuanbo/types.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed; only existing Sentry auth token, Browserslist, and chunk size warnings.
- In-app browser mobile 390x844 at `http://127.0.0.1:4321/bo/yuanbo-game`: map shows original Bo image, no horizontal overflow, no console errors.
- In-app browser negotiation check: Bo panel uses original-Bo `售后中` state card, no horizontal overflow, no console errors.
- Local Chrome/Playwright reset-save check: first-entry story intro appears; screenshot saved to `/tmp/yuanbo-story-intro-original-bo.png`; canvas 390x844 and no horizontal overflow.
- `pnpm agent:lint`: passed with existing unrelated task/docs warnings before archive.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-original-bo-story-scenes.md`
