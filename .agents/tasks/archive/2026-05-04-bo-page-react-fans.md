# Task Record: Bo page React error and fan section

- State: archived
- Started: 2026-05-04
- Completed: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Fix Chrome error in `/bo` countdown hook and redesign the fan section so fans are separated from general links.

## Acceptance Boundaries

- Functional: `/bo` should not throw `Cannot read properties of null (reading 'useState')`; countdown still updates; `合成大鸽子` remains a general project link; fans are visually/content-wise separated from Lighthouse dynamics.
- Verification: Reproduce or inspect the hook issue, run Astro build, run browser check with console logs, run `pnpm agent:lint`.
- Docs Sync: Update agent docs only if frontend debug workflow, commands, or conventions change.
- Safety: Local frontend changes only; no production writes or deploy actions.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Created task record.
- Routed work to `apps/frontend-astro/src/` with docs check through `bo-chaos-doc-sync`.
- Replaced the React static wrapper around `/bo` with an Astro wrapper so the countdown remains the only React island.
- Replaced the Reckful static wrapper with Astro for the same island boundary pattern.
- Split `/bo` links into project, fan, and Lighthouse dynamics sections.
- Simplified the countdown hook to initialize immediately and clean up a local browser interval.
- Updated Astro conventions to capture the static shell plus narrow React island pattern.
- Archived this record after verification.

## Decisions and Assumptions

- Keep the visible page minimal; do not add a heavy fan portal or static decorative content.
- The hook-order error seen during verification came from React Refresh preserving an older `useState/useRef/useEffect` hook sequence after the hook cleanup; clean fresh tab checks had no new error or warning logs.

## Files Touched

- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`
- `apps/frontend-astro/src/components/tuixiu/reckful/index.astro`
- `apps/frontend-astro/src/hooks/countDown.ts`
- `apps/frontend-astro/src/pages/bo.astro`
- `apps/frontend-astro/src/pages/reckful.astro`
- `docs/agent/CONVENTIONS.md`
- `.agents/tasks/archive/2026-05-04-bo-page-react-fans.md`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed. Local Sentry source map upload skipped because no auth token was provided.
- Browser `/bo`: fresh tab loaded countdown, `Copy To Clipboard`, `作品`, `粉丝`, and `Lighthouse 动态`; timestamp-filtered console logs after navigation were empty.
- Browser `/reckful`: fresh tab loaded countdown and copy button; timestamp-filtered console logs after navigation were empty.
- `pnpm agent:lint`: passed with `agent-lint: ok`.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-05-04-bo-page-react-fans.md`
