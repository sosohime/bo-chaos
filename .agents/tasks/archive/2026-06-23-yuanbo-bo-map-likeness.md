# Task Record: Yuanbo Bo map likeness

- State: complete
- Mode: full
- Started: 2026-06-23
- Branch: codex/miniapp-tech-refactor
- Request: Improve the large-map Bo character likeness against the existing Bo pet image.

## Acceptance Boundaries

- Functional: The map walking sprite should read as Bo pet: large head, black side-part hair, black glasses, smiling face, black polo with cyan trim, gray pants, white shoes, and small blue badge cue.
- Verification: Astro build, browser mobile first-screen check, and agent lint.
- Docs Sync: No product docs expected; task record only.
- Safety: Local Astro frontend only.
- Archive: Move record to archive when complete.

## Actions

- Compared `expertbo-preview.png` with current generated pixel sprite.
- Redrew Phaser-generated Bo walking textures to match the pet image more closely: large head, side-part black hair, thicker glasses, smiling mouth, black polo with cyan trim, gray pants, white shoes, and a small pale-blue badge cue.
- Increased the map player scale and adjusted the name label / shadow to make the sprite readable on mobile.

## Iteration Log

- User reported that the Bo in the large map still does not look like Bo.

## Deferred Verification

- None.

## Decisions and Assumptions

- Keep Phaser-generated pixel textures for walking animation, but redraw them closer to the pet image rather than using a plain image billboard.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed; only existing Sentry auth token, Browserslist, and chunk size warnings.
- In-app browser mobile 390x844: page refreshed at `http://127.0.0.1:4321/bo/yuanbo-game`, canvas 390x844, no horizontal overflow, no console warnings/errors, Bo sprite visibly updated on map.
- `pnpm agent:lint`: passed with existing unrelated task/docs warnings before archive.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-bo-map-likeness.md`
