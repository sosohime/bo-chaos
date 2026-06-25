# Task Record: Yuanbo strict QA and grounding

- State: complete
- Mode: full
- Started: 2026-06-25
- Branch: codex/yuanbo-alpha-main
- Request: Implement strict visual/runtime QA for the Yuanbo Pixi game and fix grounded character rendering.

## Acceptance Boundaries

- Functional: Align Bo/NPC foot anchors, expose hidden QA snapshots/actions, and make browser probe assert visual grounding, stable overlays, movement animation, failure recovery, save menu, and Boss completion.
- Verification: In-app browser screenshot, build, lint, simulation probe, strict browser probe, and generated QA screenshots.
- Docs Sync: No docs changes.
- Safety: Local visual/game QA only; no production browser writes.
- Archive: Archived immediately after the fix.

## Actions

- Measured `bo-walk.png` frame alpha bounds; Bo's visible feet sit around 93% of frame height, while the code anchored the sprite at 74%.
- Updated map sprite anchor to the measured foot baseline and moved the shadow to the foot position.
- Measured `npc-atlas.png`; NPC feet use the same 93% baseline, so NPCs now use foot anchors and explicit shadows.
- Added hidden `window.__YUANBO_QA__` in dev/`?qa=1`, with snapshots and deterministic QA actions.
- Rewrote `scripts/yuanbo-pixi-browser-probe.mjs` to assert visual grounding, rendered counts, movement frames, stable panels, battle reload, failure/debt recovery, Boss completion, and mobile layouts.
- Added `tmp/` to `.gitignore` for generated QA screenshots.

## Iteration Log

- Before: the shadow was far below the shoes, making Bo look airborne.
- After: feet and shadow share the same floor baseline in the in-app browser screenshot.
- Initial strict browser probe failed because the hard-coded Boss skill sequence lost; QA was extended with `useRecommendedSkill()` and the probe now verifies the game's own recommendation loop clears Boss.
- IAB read-only evaluation could not see page-world QA globals, but the same local route passed page-world Playwright QA and IAB screenshot/console verification.

## Deferred Verification

- None.

## Decisions and Assumptions

- Kept the existing asset and fixed placement math first, because the immediate bug was anchoring, not asset generation.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo-pixi/main.ts`
- `scripts/yuanbo-pixi-browser-probe.mjs`
- `.gitignore`

## Verification Evidence

- In-app browser screenshot after reload: Bo's feet align with the floor shadow instead of floating above it.
- `/tmp/yuanbo-grounded-walk.png`: mobile movement screenshot after holding `D`; Bo remains grounded while walking.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed.
- `pnpm probe:yuanbo-pixi`: passed.
- `YUANBO_URL=http://127.0.0.1:4321/retire/bo/yuanbo-game/?qa=1 pnpm probe:yuanbo-pixi:browser`: passed after dev server restart.
- Generated screenshots under `tmp/yuanbo-qa/`: desktop/mobile map, walking frame, task board, quest brief, battle, battle reload, save menu, short mobile battle.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-25-yuanbo-strict-qa.md`
