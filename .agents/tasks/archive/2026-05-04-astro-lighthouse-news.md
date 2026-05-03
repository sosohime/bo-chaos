# Task Record: Astro Lighthouse news

- State: archived
- Started: 2026-05-04
- Completed: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Keep the retirement countdown minimal, remove stale rich link, keep the game link, and add a periodically updated Lighthouse activity/news section.

## Acceptance Boundaries

- Functional: `/bo` remains a minimal countdown page, keeps the game link, removes the stale rich link, and shows a lightweight Lighthouse news/activity section sourced from updateable data.
- Verification: Inspect current local page, inspect Tencent Cloud Lighthouse source page, run Astro build, run browser check on `/bo`, run `pnpm agent:lint`.
- Docs Sync: Update agent docs if commands, workflow, frontend debug, or routing assumptions change.
- Safety: Only read public Tencent Cloud page; no login, no production write actions, no external submissions.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Created task record.
- Routed work to `apps/frontend-astro/src/`, `.github/workflows/`, and agent docs.
- Added a Lighthouse activity refresh script that reads Tencent Cloud's public product page into static Astro JSON.
- Updated `/bo` to keep a minimal countdown, keep `合成大鸽子`, remove the stale rich link, and show lightweight Lighthouse dynamics.
- Restored the intentional `/bo` meta title and description after user correction.
- Added scheduled/manual CI refresh before Astro build.
- Archived this record after verification.

## Decisions and Assumptions

- Daily update cadence is sufficient for activity links.
- The page should not use heavy official/corporate language.
- The periodic refresh runs during GitHub Actions schedule/manual dispatch and uses the existing Astro build/upload flow; this change does not run production deployment locally.

## Files Touched

- `.github/workflows/pnpm.yml`
- `apps/frontend-astro/package.json`
- `apps/frontend-astro/scripts/update-lighthouse-news.mjs`
- `apps/frontend-astro/src/components/tuixiu/bo/index.tsx`
- `apps/frontend-astro/src/data/lighthouse-activities.json`
- `apps/frontend-astro/src/pages/bo.astro`
- `docs/agent/COMMANDS.md`
- `docs/agent/FRONTEND_DEBUG.md`
- `.agents/tasks/archive/2026-05-04-astro-lighthouse-news.md`

## Verification Evidence

- Public source inspected: `https://cloud.tencent.com/product/lighthouse?Is=sdk-topnav`, showing current Lighthouse links for OpenClaw, 2026开年大促, 免费体验, and OrcaTerm.
- `pnpm -C apps/frontend-astro update:lighthouse-news`: passed after approved network access; wrote 5 activity links.
- `pnpm -C apps/frontend-astro build`: passed. Sentry source map upload skipped locally because no auth token was provided.
- Browser check: opened `http://127.0.0.1:4321/bo`; verified title, countdown, `合成大鸽子`, `Reckful`, Lighthouse dynamic links, and empty browser warning/error logs.
- `pnpm agent:lint`: passed with `agent-lint: ok`.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-05-04-astro-lighthouse-news.md`
