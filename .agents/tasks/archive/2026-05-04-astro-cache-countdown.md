# Task Record: Astro cache and countdown hardening

- State: archived
- Started: 2026-05-04
- Completed: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Chrome cached an old Vite chunk and still hit the React `useState` error; solve the cache issue rather than only telling the user to clear cache.

## Acceptance Boundaries

- Functional: Astro dev/preview responses should discourage stale chunk caching; `/bo` and `/reckful` countdowns should not depend on React hooks.
- Verification: Run Astro build, run local browser checks for `/bo` and `/reckful`, inspect console logs, run `pnpm agent:lint`.
- Docs Sync: Update frontend debug/conventions docs if the validation or implementation pattern changes.
- Safety: Local frontend and docs only; no production writes or deploy actions.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Created task record.
- Added Vite middleware in Astro config to set no-store headers during dev and preview.
- Replaced the React countdown islands on `/bo` and `/reckful` with one Astro countdown component and a small browser script.
- Removed the retired React countdown hook, dynamic components, and copy button component from the Astro app.
- Updated frontend docs to capture the no-store and Astro countdown pattern.
- Archived this record after verification.

## Decisions and Assumptions

- The observed Chrome error was caused by cached/stale Vite development chunks or React Refresh state, not by production data.
- Removing React hooks from the countdown pages is acceptable because the interaction is a simple timer and clipboard behavior.
- The app still keeps the existing React integration dependency for now to avoid unrelated dependency cleanup in this task.

## Files Touched

- `apps/frontend-astro/astro.config.mjs`
- `apps/frontend-astro/src/components/tuixiu/countdown.astro`
- `apps/frontend-astro/src/pages/bo.astro`
- `apps/frontend-astro/src/pages/reckful.astro`
- `docs/agent/CONVENTIONS.md`
- `docs/agent/FRONTEND_DEBUG.md`
- `.agents/tasks/archive/2026-05-04-astro-cache-countdown.md`

## Verification Evidence

- `curl -I http://127.0.0.1:4321/bo`: returned `Cache-Control: no-store, max-age=0, must-revalidate`.
- `pnpm -C apps/frontend-astro build`: passed. Local Sentry source map upload skipped because no auth token was provided.
- Browser `/bo`: loaded native countdown, copy button, `作品`, `粉丝`, and `Lighthouse 动态`; timestamp-filtered console logs after navigation were empty.
- Browser `/reckful`: loaded native countdown, secondary countdown, and copy button; timestamp-filtered console logs after navigation were empty.
- `rg "useTuixiuCountDown|countDown.ts|client:only=\"react\"|CopyToClipboardButton|chunk-XOMV7EOH" apps/frontend-astro/src apps/frontend-astro/dist -n`: no matches.
- `pnpm agent:lint`: passed with `agent-lint: ok`.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-05-04-astro-cache-countdown.md`
