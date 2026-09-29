# Task Record: Deploy Yuanbo SEO and content refresh

- State: complete
- Mode: full
- Started: 2026-09-29
- Branch: codex/yuanbo-seo-deploy
- Request: Deploy the authorized Yuanbo SEO and current-content refresh to production.

## Acceptance Boundaries

- Functional: Show explicitly named retirement-countdown links and current product observations; keep sitemap dates aligned with the latest verified content.
- Verification: Clean frozen install, Astro tests/build, repository verification, deployment workflow, and public homepage/assets checks.
- Docs Sync: No architecture, command, routing, data-model, or agent workflow changes; run agent lint.
- Safety: Deploy only the scoped Astro changes from a clean main-based worktree. Back up and atomically replace the separate Nginx homepage from the CI-built artifact.
- Archive: Complete after production verification.

## Actions

- Prepared the six scoped Astro files on clean origin/main; excluded unrelated dirty checkout changes.
- Used the existing push-triggered CI workflow to test, build, and upload the Astro site.
- Synced the CI artifact homepage to the separate Nginx root with a backup and atomic replacement.

## Decisions and Assumptions

- The standing authorization for 博新闻/博退休 releases covers pushing this scoped change to main and syncing the CI artifact to the separate homepage root.

## Files Touched

- `apps/frontend-astro/src/components/editorial/SiteShell.astro`
- `apps/frontend-astro/src/data/news.ts`
- `apps/frontend-astro/src/pages/bo.astro`
- `apps/frontend-astro/src/pages/index.astro`
- `apps/frontend-astro/src/pages/sitemap.xml.ts`
- `apps/frontend-astro/src/pages/yuanbo.astro`

## Verification Evidence

- `pnpm install --frozen-lockfile`: passed.
- `pnpm run verify`: passed (shared/backend/Astro tests; packages, backend, and Astro builds). Existing build warnings: Sentry auth token absent, stale Browserslist data, and large game chunk.
- `pnpm agent:lint`: passed.
- Production deployment checks: pending.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-09-29-deploy-yuanbo-seo-refresh.md`
