# Task Record: Yuanbo RPG Depth CR

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: current worktree
- Request: Use subagent CR to evaluate UI, playability, story, then expand Yuanbo RPG story and growth toward a compelling repeatable game.

## Acceptance Boundaries

- Functional: Use subagent CR for UI, playability, and story/growth; expand the game with mechanics and content that increase replay motivation rather than filler.
- Verification: Run Astro build, agent lint, browser scene checks for map/dialog/battle/codex/ending where feasible, and record subagent findings plus fixes.
- Docs Sync: No agent docs changes unless commands/routing/conventions change.
- Safety: Local Astro game only; no backend, production writes, secrets, paid operations, or destructive git commands.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Confirmed routing to Astro game: primary `apps/frontend-astro/src/game/yuanbo/`, secondary page shell/assets.
- Read frontend debug workflow and created this task record.
- Spawned three subagent CRs for gameplay/management, UI/adaptation, and story/growth.
- Implemented route vows as real build choices that affect skills, rewards, Boss pressure, and route identity.
- Reworked negotiation skill UI to use sorted paged skill groups so high-level/Shadow skills are reachable instead of sliced away.
- Added same-source issue cleanup/mitigation on retry success or partial success, plus a management crisis consequence when cash/pressure collapse.
- Expanded Boss issue trials so budget, SLA, compliance, delivery, and pressure debts create distinct battle effects and lines.
- Added Boss variants for delivery, compliance, and pressure trials.
- Changed Boss partial success into a retryable trial-run state instead of a full ending.
- Added repeated core refrain lines around "收钱 / 再梳 / 拉表关单" to opening, chapter progression, and aftermath.
- Changed advanced quest unlocking to consider concrete prior work/issues, not only completed-count gates.
- Rebuilt the codex into Overview/Achievements/Stories pages.
- Added a map-specific Bo cutout without the "1" bubble, adjusted mobile hint/button layout, increased PC dialog title/body spacing, and added simple map blockers.

## Iteration Log

- Not visual-fast-lane; this is a full game-depth iteration.

## Deferred Verification

- None yet.

## Decisions and Assumptions

- The requested "5MB" is treated as a proxy for real content depth and replayable substance, not license to pad bundles with useless bytes.
- The game is still far below 5MB of meaningful source/assets, so this pass focused on high-leverage mechanics instead of padding.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/public/codex-pets/expertbo-map-cutout.png`

## Verification Evidence

- Subagent gameplay CR: 6.2/10; called out soft failure consequences, non-build-like skills, short content pool, Boss partial leniency, and weak issue identity.
- Subagent story/growth CR: 6.5/10; called out skill UI truncation, weak core refrain, count-based unlocks, imprecise failure debt, shallow routes, and incomplete Boss recovery.
- Subagent UI CR: 6.5/10; found no P0, but called out PC dialog spacing, codex overflow, mobile hint conflict, map Bo bubble, and static player feel.
- `pnpm -C apps/frontend-astro build`: passed. Yuanbo bundle `1,562.49 kB` minified, `376.24 kB` gzip.
- Browser QA with in-app browser:
  - Mobile 390x844 map screenshot: no horizontal overflow, no console errors, Bo map cutout has no "1" bubble, hint is above controls.
  - Desktop 1280x800 map screenshot: no horizontal overflow, no console errors.
  - Desktop menu/codex overview/achievements/stories screenshots: no console errors; codex pages no longer overflow the panel.
- Standalone Chrome Playwright scene script was attempted twice but local Chrome headless was killed by the OS; in-app browser was used for visual checks instead.
- `pnpm agent:lint`: exited 0 with existing warnings for another active task record and docs sync hints.

## Handoff / Archive Notes

- Final state: archive this iteration; overall thread goal remains active because 5MB-quality depth and full scene coverage are not yet achieved.
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-rpg-depth-cr.md`
