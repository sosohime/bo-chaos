# Task Record: Yuanbo Bo cutout

- State: complete
- Mode: full
- Started: 2026-06-23
- Branch: codex/miniapp-tech-refactor
- Request: Remove the white square from original Bo image usage while keeping original Bo art.

## Acceptance Boundaries

- Functional: Map and scene Bo images use original Bo art without the large white background block.
- Verification: Astro build, browser mobile screenshot, agent lint.
- Docs Sync: No product docs expected; task record only.
- Safety: Local Astro frontend only.
- Archive: Move record to archive when complete.

## Actions

- Routed work to `apps/frontend-astro` Yuanbo game.
- Added runtime cutout generation for original Bo and ShadowBo images by flood-filling connected near-white background pixels from image edges.
- Switched map player and Bo scene cards to `expertBoCutout` / `shadowBoCutout`.
- Changed Bo scene card backgrounds from light blocks to dark translucent panels so the image no longer reads as a white square.

## Iteration Log

- User rejected the raw original image because the baked-in white square looked like a bed/background block.

## Deferred Verification

- None.

## Decisions and Assumptions

- Keep original Bo pixels but generate a transparent cutout texture at runtime by removing connected near-white background from image edges.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed; only existing Sentry auth token, Browserslist, and chunk size warnings.
- In-app browser mobile map: Bo appears without the baked-in white square, canvas 390x844, no horizontal overflow, no console errors.
- In-app browser mobile negotiation: Bo state card uses cutout art on dark translucent panel, no horizontal overflow, no console errors.
- `pnpm agent:lint`: passed with existing unrelated task/docs warnings before archive.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-bo-cutout.md`
