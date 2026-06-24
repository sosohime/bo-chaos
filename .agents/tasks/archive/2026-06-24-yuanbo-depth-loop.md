# Task Record: Yuanbo RPG Depth Loop

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: current worktree
- Request: Continue the persistent goal of making Yuanbo RPG feel like a sustained management RPG with stronger story, growth, CR, and scene verification.

## Acceptance Boundaries

- Functional: Add meaningful replay/growth/story systems that affect the game loop, not padding or detached text.
- Verification: Run Astro build, targeted TypeScript check for Yuanbo files, browser checks for map/negotiation/codex where feasible, and `pnpm agent:lint`.
- Docs Sync: No docs update unless commands, architecture, or agent instructions change.
- Safety: Local Astro game only; no backend, production writes, paid operations, secrets, or destructive git commands.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Routed the task to `apps/frontend-astro`.
- Spawned read-only subagent CR to review UI, playability, story, growth, and whether it currently qualifies as a game.
- Added system-backed narrative depth: 21 case memories, 16 route milestones, and 4 route legacies that unlock through outcomes/routes/Boss wins.
- Wired case memories into negotiation settlement, route milestones into progression rewards, and route legacies into Boss win/new cycle effects.
- Added next-route-milestone visibility to task board and codex.
- Added quest-aware skill loadout entry from customer briefs and quest-aware auto-recommend.
- Addressed CR P0 mobile risks by limiting mobile battle skills to 4 per page and making dense mobile dialog options render in compact two-column rows.
- Added a daily operating cost/maintenance debt check on rest-to-next-day so unpaid operations convert into pressure and a maintenance issue.
- Added direct task board actions for available quests, reducing map/menu friction.
- Changed the page's map Bo asset source to the original ExpertBo cutout so the map no longer references the old narrow map crop.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- Browser checks pending after implementation.

## Decisions and Assumptions

- Treat the "5MB" target as meaningful game content and system depth, not arbitrary padding.
- Prioritize story/growth systems that create reasons to replay: route milestones, case memories, and cycle legacy.
- The current turn does not complete the 5MB/content-depth objective; it removes blockers and adds replay hooks for the next expansion.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- Subagent CR completed: current game scored 5.8/10 and identified mobile layout as P0 plus content/deeper management as P1.
- `pnpm -C apps/frontend-astro exec tsc --noEmit --pretty false 2>&1 | rg "src/game/yuanbo" || true`: no Yuanbo game errors.
- `pnpm -C apps/frontend-astro build`: passed. Latest Yuanbo bundle `1,576.41 kB` minified, `381.86 kB` gzip.
- Browser 360x640: map loaded, no horizontal overflow, no console errors.
- Browser 360x640: task board direct quest buttons fit in two columns; brief and battle screens had no horizontal overflow or console errors.
- Browser 390x844: map, task board, customer brief, battle, and skill loadout dialog fit without horizontal overflow or console errors.
- Content size checkpoint: Yuanbo source plus Bo assets total `317286` bytes; still far from meaningful 5MB target.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-depth-loop.md`
