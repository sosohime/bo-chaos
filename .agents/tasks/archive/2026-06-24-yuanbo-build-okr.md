# Task Record: Yuanbo Build And OKR Systems

- State: archived
- Mode: full
- Started: 2026-06-24
- Branch: current worktree
- Request: Continue improving Yuanbo RPG toward compelling replayability by adding build choices, weekly OKR choice, story/growth depth, and scene verification.

## Acceptance Boundaries

- Functional: Add real player choices for skill loadout and weekly OKR so growth is not just a full skill list plus automatic rewards.
- Verification: Run Astro build, agent lint, and browser checks for training/loadout/OKR where feasible.
- Docs Sync: No docs update unless commands or agent instructions change.
- Safety: Local Astro game only; no backend, production writes, paid operations, secrets, or destructive git commands.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Confirmed routing to Astro game area and frontend debug workflow.
- Added `equippedSkills` and `weeklyGoalId` to save state with normalization for old saves.
- Added training-table entries for skill loadout and weekly OKR selection.
- Implemented paged skill loadout UI with equip/unequip and auto-recommend actions.
- Changed negotiation to use equipped skills only, while keeping all unlocked skills reachable from loadout.
- Added weekly OKR choices and made incomplete OKR increase Boss opening pressure.
- Spawned one focused read-only subagent CR for this increment.
- Addressed CR findings: removed unchosen OKR Boss penalty, converted OKR progress to choice-time baseline deltas, fixed clean-week progress semantics, and cleared Yuanbo game TypeScript errors.
- Replaced the map player texture source with the original ExpertBo pet asset processed into a transparent subject texture, removing the old narrow map crop and the white/number badge artifact.
- Updated negotiation portraits to use the same processed ExpertBo subject texture, keeping mood staging without the white photo block.
- Increased movement speed and removed the rotating player wobble that made movement feel jumpy.
- Re-verified desktop and mobile map/negotiation scenes in the in-app browser.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- None yet.

## Decisions and Assumptions

- Treat "5MB" as meaningful playable content/depth, not arbitrary padding.
- Kept skill loadout persistent across days/weeks so players can form a build identity, while OKR resets on new cycle.
- Keep the original Bo pet image as the canonical likeness; Phaser may process it into transparent textures, but should not replace it with a synthetic face or a white-card thumbnail.
- If no OKR is selected, there is no OKR reward and no Boss penalty; once selected, progress is measured from the selection baseline.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed. Yuanbo bundle `1,565.79 kB` minified, `377.44 kB` gzip.
- In-app browser desktop `1280x800`: game loaded, no horizontal overflow, no console errors.
- In-app browser desktop `1280x800`: map shows original ExpertBo subject as player, not dot/narrow crop/white block; negotiation portrait shows transparent ExpertBo subject.
- In-app browser mobile `390x844`: map canvas fits viewport with no horizontal overflow; mobile negotiation fits two-column skills with no console errors.
- `pnpm -C apps/frontend-astro exec tsc --noEmit --pretty false 2>&1 | rg "src/game/yuanbo" || true`: no Yuanbo game errors. Full app tsc still stops on existing `eslint.config.mjs` portable inferred type warning.
- `pnpm agent:lint`: exited 0 with existing warnings for another active task record and docs sync hints.
- Content size checkpoint: `apps/frontend-astro/src/game/yuanbo/*` plus Bo pet assets total `296366` bytes, still far from a meaningful 5MB content target.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-build-okr.md`
