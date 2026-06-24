# Task Record: Yuanbo RPG Content Loop Expansion

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: current worktree
- Request: Continue the persistent Yuanbo RPG goal by improving gameplay, story depth, growth motivation, subagent CR, and scene verification toward a 5MB-quality game.

## Acceptance Boundaries

- Functional: Add real story/growth/replay systems and content that are used by gameplay, not padding.
- Verification: Subagent review, targeted TypeScript check, Astro build, browser scene checks, and `pnpm agent:lint`.
- Docs Sync: No command/architecture docs change expected; record lint warnings if heuristic-only.
- Safety: Local Astro game only; no backend, production writes, paid operations, secrets, or destructive git commands.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Routed to `apps/frontend-astro` per `docs/agent/ROUTING.md`.
- Baseline current source plus Bo pet assets: `349168` bytes.
- Spawned read-only subagent CR (`Zeno`) for UI/playability/story/growth/replay/mobile review.
- Added long-term growth systems:
  - `LONG_TERM_GOALS`: 10 meaningful cross-run goals tied to route mastery, customer count, codex progress, trust network, clean Boss, legacies, and cashflow.
  - `BOSS_DOCKET_CARDS`: 10 Boss preparation cards unlocked by long-term goals and applied as real Boss combat modifiers.
  - Added a Codex/案卷 `目标` page so players can track long-term goals and Boss materials.
- Expanded story/replay content:
  - Added 16 new case variants for the 8 newer customers.
  - Added route and long-term story cards so milestones become readable narrative beats.
- Addressed subagent P1 feedback:
  - Replaced `id.includes(...)` variant gating with exact `CASE_VARIANT_CONDITIONS` mapping.
  - Verified all 34 `CASE_VARIANTS` have explicit condition mappings.
  - Removed Boss material effect limit; all unlocked Boss material cards now apply, while only log display is shortened.
  - Replaced generic long-term reward logic with per-goal reward effects.
  - Delayed Boss unlock from 4 customers to 6 customers plus a formed route/level/cycle condition.

## Iteration Log

- Subagent verdict: current build is already a qualified web RPG MVP, but not yet 5MB-grade long-form content. Scores: UI 7, playability 7, story 7, growth 7, replay 6, mobile 6.
- Subagent P1 items were long-term/Boss systems being too textual, variants too loosely gated, and Boss unlock too early. This iteration targeted those issues directly.

## Deferred Verification

- The full 5MB meaningful-content target remains incomplete. Current meaningful source/assets grew to `376641` bytes; next rounds need much larger quest/event/Boss/story pools and stronger map-space decisions, not padding.

## Decisions and Assumptions

- Treat 5MB as a meaningful content/depth target, not an invitation to pad files.
- Prioritize剧情、成长性、持续动力 over cosmetic-only changes.
- Boss should require more preparation now that there are enough advanced customers and long-term goals.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `.agents/tasks/active/2026-06-24-yuanbo-rpg-content-loop-expansion.md`

## Verification Evidence

- `pnpm -C apps/frontend-astro exec tsc --noEmit --pretty false 2>&1 | rg "src/game/yuanbo|yuanbo-game" || true`: no Yuanbo-specific TypeScript output.
- Variant mapping check: `variantCount: 34`, `mappedCount: 34`, `missing: []`.
- `pnpm -C apps/frontend-astro build`: passed. Only Sentry token, Browserslist, and Vite chunk-size warnings.
- Browser check on `http://127.0.0.1:4321/bo/yuanbo-game`:
  - Opened Codex/案卷 with `C`.
  - Mobile canvas rendered with no document overflow.
  - Overview showed `目标` tab entry, long-term goal summary, Boss material count, and route progress.
  - Console errors: none.
- `pnpm agent:lint`: exited 0. After archiving this record, remaining warnings are an unrelated older active task and docs-sync heuristics.

## Handoff / Archive Notes

- Final state: archived after final lint pass.
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-rpg-content-loop-expansion.md`
