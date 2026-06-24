# Task Record: yuanbo after-sales game

- State: active
- Mode: full
- Started: 2026-06-22
- Branch: codex/miniapp-tech-refactor
- Request: Build a responsive browser game named 袁博の极限售后 with local browser save and copyable migration.

## Acceptance Boundaries

- Functional: Add a PC and mobile responsive Astro game page with infinite loop growth, local browser save, and import/export migration; link it from the public Bo page.
- Verification: Run `pnpm -C apps/frontend-astro build`, browser-check the route at desktop and mobile sizes, and run `pnpm agent:lint`.
- Docs Sync: Agent docs are unaffected unless architecture, commands, routing, or conventions change.
- Safety: No backend, production writes, schema changes, deploys, pushes, or secrets handling.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Routed task to `apps/frontend-astro` as a public static/browser-only game.
- Noted existing unrelated miniapp and agent-doc worktree changes and avoided them.
- Adjusted game theme per user direction to focus on cloud service and AI product manager scenarios.
- Added the responsive Astro game route at `/bo/yuanbo-game` with local save, export/import migration, progression, upgrades, and cloud/AI customer events.
- Added a public Bo page entry linking to the game.
- Added clipboard fallback and localStorage failure messaging.

## Iteration Log

- N/A.

## Deferred Verification

- N/A.

## Decisions and Assumptions

- Implement as an Astro page with an inline browser script instead of adding dependencies or a backend.
- Preserve the originating joke as absurd after-sales negotiation rather than explicit adult content.
- Use AI/cloud service events such as Agent rollout, GPU bills, SLA explanation, cloud migration, model prompts, and private deployment.

## Files Touched

- `.agents/tasks/active/2026-06-22-yuanbo-after-sales-game.md`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed; generated `/bo/yuanbo-game/index.html`.
- Browser check at `http://localhost:4321/bo/yuanbo-game` desktop: route rendered, four action buttons present, local save persisted after reload, no horizontal overflow, no console errors.
- Browser interaction: clicked `收钱报价`; day advanced to 2, cash changed, customer/log advanced.
- Browser save migration: export produced `YBG1:` save code; import restored the save and displayed success.
- Browser mobile check at 390x844: no horizontal overflow, actions readable, side panel stacked below stage, no console errors.
- `pnpm agent:lint`: passed with warnings from pre-existing unrelated active miniapp/doc worktree state (`multiple-active-tasks`, missing Mode in `.agents/tasks/active/2026-06-22-miniapp-photo-browser-polish.md`, agent docs changed without AGENTS.md changing).

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-22-yuanbo-after-sales-game.md`
