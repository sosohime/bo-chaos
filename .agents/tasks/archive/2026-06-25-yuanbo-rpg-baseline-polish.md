# Task Record: Yuanbo RPG baseline polish

- State: active
- Mode: full
- Started: 2026-06-25
- Branch: codex/yuanbo-game-rpg-polish
- Request: Polish Yuanbo RPG baseline UX, mobile menu, interaction targeting, Bo clipping, onboarding, copy, responsive controls, verify, commit, and push.

## Acceptance Boundaries

- Functional: Fix mobile menu/touch targets, interaction target priority, Bo portrait clipping, first-order onboarding, misleading labels, dry system copy, and mobile panel spacing.
- Verification: Build Astro, run agent lint, verify PC 1280x800 and mobile 390x844 flows for movement, interaction, menu, order, negotiation, settlement, training, save export/import.
- Docs Sync: No architecture or command docs expected unless the implementation changes documented behavior.
- Safety: Do not touch unrelated miniapp/design working tree changes. Do not write production services. Push only after local verification.
- Archive: Move this record to archive when complete or handed off.

## Actions

- Created task record and routed work to `apps/frontend-astro`.
- Synced the latest `origin/main` Yuanbo game baseline into this worktree, including the source Bo portrait sprite sheet and homepage blank-target entry.
- Added a larger mobile menu hit zone and verified the right-top menu opens at `390x844`.
- Reworked world interaction targeting into a single current target used by highlight, hint text, keyboard interaction, and the mobile interaction button.
- Added first-order onboarding copy and a `第一单` marker for the GPU billing customer.
- Renamed the misleading `训练团队` NPC/client text to `GPU 账单客户` / `财务凝视的 GPU 团队`.
- Added visual margins for the oversized Bo walking sprite so he does not clip at world edges.
- Replaced `window.prompt()` save import with a responsive paste overlay that works in the in-app browser and mobile viewport.
- Loosened mobile dialog and negotiation skill button spacing.
- Reworded field operations, training, task board, and empty interaction copy into clearer Bo-flavored guidance.

## Iteration Log

- n/a

## Deferred Verification

- Browser checks and build/lint after implementation.

## Decisions and Assumptions

- Primary area is Astro public page/game code.
- Existing unrelated miniapp/design changes are user work and will be left untouched.

## Files Touched

- `.agents/tasks/active/2026-06-25-yuanbo-rpg-baseline-polish.md`
- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`
- `apps/frontend-astro/public/codex-pets/yuanbo-source2-portraits-v1.png`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed. Sentry auth-token and chunk-size warnings only.
- Browser desktop `1280x800`: loaded local game, opened menu, exported migration code fallback panel, opened quest brief, entered negotiation, completed rounds to a partial-success settlement, returned to map, and opened training.
- Browser mobile `390x844`: loaded local game, confirmed two-line HUD/status, opened right-top menu, opened import overlay, filled a valid `YBRPG3:` code, imported successfully, and used DOM mobile interaction button to open the current target panel.
- Source scan: game page has no `yrpg-back`, homepage Yuanbo game entry has `target="_blank"`, source Bo portraits are passed through `data-bo-portraits-src`, no remaining `window.prompt()` import path.
- `pnpm agent:lint`: exited successfully with existing warning about unrelated agent docs changes already present in the working tree.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-25-yuanbo-rpg-baseline-polish.md`
