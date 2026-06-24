# Task Record: Yuanbo Content And Strategy Expansion

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: current worktree
- Request: Continue the persistent Yuanbo RPG goal by expanding content, adding meaningful route mechanics, re-reviewing, and testing scenes.

## Acceptance Boundaries

- Functional: Expand the customer/story pool and add gameplay decisions that change negotiation/management behavior.
- Verification: Run Astro build, targeted Yuanbo TypeScript check, browser scene checks, and `pnpm agent:lint`.
- Docs Sync: No docs update unless commands, architecture, or agent instructions change.
- Safety: Local Astro game only; no backend, production writes, paid operations, secrets, or destructive git commands.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Routed to `apps/frontend-astro`.
- Baseline size: Yuanbo source plus Bo pet assets total `317286` bytes.
- Expanded the Yuanbo RPG content pool from the earlier 6-customer slice toward a larger replayable prototype:
  - Added 8 extra customers/NPCs, for 14 non-boss customers plus the Boss.
  - Added 24 case memories for the new customers.
  - Added contract stance data and UI entry points.
- Replaced the map protagonist source with the existing Bo pet map asset:
  - Page now passes `/codex-pets/expertbo-map-cutout.png`.
  - Phaser now prioritizes `data-map-bo-src`.
  - Map character renders the real Bo pet map image directly, without regenerating a white cutout texture.
- Improved map movement and touch/keyboard feel:
  - Increased movement speed.
  - Smoothed acceleration more aggressively.
  - Added resize/orientation redraw handling.
  - Added Enter-as-primary-action support in modals.
  - Expanded Phaser button hit areas to the whole button container.
- Added management pressure mechanics:
  - Refuse-review now has a once-per-customer-per-cycle guard and adds relationship loss plus a small issue, avoiding the boundary/XP farming exploit.
  - Rest now previews upkeep cost, expected debt, and issue impact before ending the day.
- Made contract stances affect rules, not only numbers:
  - Prepaid changes budget pressure/win threshold.
  - Milestone can stage-close into partial success.
  - Hard-boundary can actively terminate high-scope talks into partial success.
  - Shadow alternative injects a mid-battle branching moment.
- Reworked compact mobile negotiation layout so log/goal/skill zones do not overlap at 390x640.
- Requested read-only subagent CR from `Mill`.

## Iteration Log

- Not visual-fast-lane.
- Subagent CR found no P0; raised P1s for refuse-review farming, compact mobile negotiation overlap, and stance mechanics being too numeric. These were addressed in this iteration.

## Deferred Verification

- 5MB-scale content remains deferred. Current meaningful source/assets total is still far below 5MiB and should be grown through real quests, variants, event chains, and Boss docket entries rather than padding.

## Decisions and Assumptions

- Treat 5MB as a content/depth target, not a padding target.
- Route identity needs mechanics, not just stat bonuses.
- Use existing Bo pet map asset as the map protagonist for now, because user explicitly rejected hand-drawn/pixel substitute Bo.

## Files Touched

- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/game/yuanbo/types.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro exec tsc --noEmit --pretty false 2>&1 | rg "src/game/yuanbo|yuanbo-game" || true`: no Yuanbo-specific TypeScript output.
- `pnpm -C apps/frontend-astro build`: passed. Sentry auth token warnings and Vite large chunk warning are existing/non-blocking for this local game bundle.
- Browser desktop 1280x800:
  - Canvas rendered without page overflow.
  - Map protagonist is the real Bo pet map image, not a circle/dot/pixel substitute.
- Browser mobile 390x844:
  - Map and customer brief render without horizontal overflow.
  - Strategy menu fits.
  - Negotiation scene opens via `E` then `Enter`; no console errors.
- Browser mobile 390x640:
  - Negotiation scene renders without horizontal overflow.
  - Log and skill buttons no longer overlap.
- Current source plus Bo pet assets total after this iteration: `348701` bytes.
- `pnpm agent:lint`: exited 0. After archiving this record, remaining warnings are an unrelated older active task record and agent-doc sync heuristics; no blocking lint failure.

## Handoff / Archive Notes

- Final state: archived after local verification.
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-content-strategy.md`
