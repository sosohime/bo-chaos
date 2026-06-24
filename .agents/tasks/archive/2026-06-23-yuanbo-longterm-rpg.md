# Task Record: Yuanbo Long-Term RPG Loop

- State: active
- Mode: full
- Started: 2026-06-23
- Branch: current worktree
- Request: Continue improving `袁博の极限售后` until it has stronger story, growth, UI, replay motivation, scene QA, and subagent review.

## Acceptance Boundaries

- Functional: Add systems that materially improve sustained play: story collection, achievements, route identity, customer memory, additional content, and clearer progression.
- Verification: Run Astro build, agent lint, browser checks for desktop/mobile, and a second subagent review after implementation.
- Docs Sync: No command or architecture docs should change unless verification commands or app routing change.
- Safety: Astro local-only changes; no backend, production writes, secrets, or destructive git operations.
- Archive: Move this record to `.agents/tasks/archive/` before finalizing the turn.

## Actions

- Started from the existing Phaser/Astro Yuanbo game slice.
- Added achievement and story-card data for a visible collection loop.
- Expanded skills from 9 to 13, including higher-tier pricing, delivery, SLA, and shadow options.
- Expanded daily events from 8 to 15 with more cloud-support and after-sales debt situations.
- Added `售后案卷` menu view with route progress, next goal, relationships, achievements, and story cards.
- Added keyboard shortcuts: `M` for menu and `C` for codex.
- Added NPC identity icons and interaction highlighting.
- Addressed second-round gameplay CR:
  - Boss no longer biases the ending route through its own `shadow` route score.
  - Higher-tier skills now require player level or matching training level, not just any training.
  - Customer relationships now affect negotiation opening anger, budget, and trust.
  - Rest-event choices no longer grant free training levels; they add XP/route inspiration instead.
- Addressed second-round UI CR:
  - Moved mobile map hint above the touch controls.
  - Removed near-NPC player label crowding.
  - Reworked desktop negotiation log and skill dock to avoid overlap.
  - Shortened codex content for mobile/desktop panel readability.

## Decisions and Assumptions

- Primary area is `apps/frontend-astro/src/game/yuanbo/`; the Astro shell/layout may be touched only for rendering issues.
- User still wants original Bo pet identity, so current pass keeps original Bo art but improves systems and visual feedback around it.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `.agents/tasks/active/2026-06-23-yuanbo-longterm-rpg.md`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- Browser QA with Chrome/Playwright:
  - `1280x800` desktop negotiation: no 4xx, no console errors, no horizontal overflow; screenshot `/tmp/yb11-desktop-battle.png`.
  - `390x844` mobile map/codex: no 4xx, no console errors, no horizontal overflow; screenshots `/tmp/yb11-mobile-map.png`, `/tmp/yb11-mobile-codex.png`.
- Second-round subagent CR completed for gameplay/growth and UI/responsive issues; P1/P2 items from the returned reports were addressed where scoped in this turn.

## Handoff / Archive Notes

- Final state: complete for this iteration; overall thread goal remains active because 5MB-scale content and final quality bar are not yet proven.
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-longterm-rpg.md`
