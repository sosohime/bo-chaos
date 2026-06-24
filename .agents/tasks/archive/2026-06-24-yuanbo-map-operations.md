# Task Record: Yuanbo Map Operations Expansion

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: current worktree
- Request: Continue the persistent Yuanbo RPG goal by improving game feel, story/growth motivation, and map-space gameplay toward a 5MB-quality game.

## Acceptance Boundaries

- Functional: Add map-space decisions that affect management, route growth, issues, and Boss preparation; keep content meaningful and system-driven.
- Verification: Subagent CR, targeted TypeScript check, Astro build, browser scene checks, and `pnpm agent:lint`.
- Docs Sync: No command/architecture docs changes expected; record lint warnings if heuristic-only.
- Safety: Local Astro game only; no backend, production writes, paid operations, secrets, or destructive git commands.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Routed to `apps/frontend-astro` per `docs/agent/ROUTING.md`.
- Baseline source plus Bo pet assets: `376641` bytes.
- Read `boshuo` skill source and kept the game text rooted in the original售后 joke.
- Spawned read-only CR subagent; accepted its P0/P1 findings around missing field-operation helpers and locked-operation execution.
- Replaced the visible Bo presentation path with original Bo pet cutouts for map and negotiation surfaces; removed the white-card/pseudo-pixel look from the active presentation.
- Added field-operation helper chain and map hotspot state labels for route/action availability.
- Fixed mobile Phaser button hit areas by binding pointer handlers to the visible rectangle/text instead of relying on container hit areas.
- Fixed desktop negotiation portrait panel origins so the Bo/client cards no longer cover the header.

## Iteration Log

- Added `fieldOperationKey`, `fieldOperationDone`, `fieldOperationsFor`, and `clearFieldIssue`.
- Field hotspots now show current route/category availability instead of generic `FIELD/DONE`.
- Field-operation dialogs now show action cost, route, issue-cleanup target, and risk before spending AP.
- Field operations now guard both `unlock` and AP before applying effects.
- Map Bo now uses `expertbo-map-cutout.png`; negotiation Bo states derive from `expertbo-cutout.png` plus tint/pose, and Shadow state uses `shadowbo-cutout.png`.
- Movement collision body was centered to reduce decor push-out jumping around the scaled Bo PNG.
- Desktop negotiation layout was rechecked after correcting portrait panel origins.

## Deferred Verification

- Mobile negotiation screenshot capture timed out twice in the in-app browser after viewport switching, but DOM viewport checks and console checks passed.
- Standalone `pnpm -C apps/frontend-astro exec tsc --noEmit --pretty false` is blocked by the existing repo-level `eslint.config.mjs` inferred-type issue; Astro build performs the practical frontend build check.

## Decisions and Assumptions

- Prioritize map-space decisions because subagent identified the map layer as mostly traversal-to-menu.
- Keep adding meaningful systems/content; do not pad files just to reach 5MB.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/types.ts`
- `.agents/tasks/active/2026-06-24-yuanbo-map-operations.md`

## Verification Evidence

- `pnpm -C apps/frontend-astro build` passed after the field-operation helper and Bo asset changes.
- `pnpm -C apps/frontend-astro build` passed again after mobile hit-area fixes.
- `pnpm -C apps/frontend-astro build` passed again after desktop negotiation panel-origin fix.
- Browser mobile map check: canvas 373x908 matched viewport width, no horizontal overflow, no game console errors, original Bo cutout visible.
- Browser mobile field-operation check: hotspot dialog opened, real tap spent AP and updated field state labels, no game console errors.
- Browser desktop 1280x800 map check: canvas 960x540 scaled to 1280x720, document 1280x800 without overflow, original Bo cutout visible.
- Browser desktop negotiation check: title, Bo portrait, stats, log, client card, and skill buttons visible after panel-origin fix; no game console errors.
- Source-size check after changes: `apps/frontend-astro/src/game/yuanbo/*` totals `256428` bytes; built Yuanbo client chunk is about `1,614.71 kB` minified.

## Handoff / Archive Notes

- Final state: archived after this record update.
- Archive path: `.agents/tasks/archive/2026-06-24-yuanbo-map-operations.md`
