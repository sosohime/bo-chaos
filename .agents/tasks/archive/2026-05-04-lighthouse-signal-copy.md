# Task Record: Lighthouse signal copy

- State: archived
- Started: 2026-05-04
- Completed: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Reword `/bo` copy and improve Lighthouse scraping so product capability news such as Hermes Agent is kept while generic discounts are filtered.

## Acceptance Boundaries

- Functional: `/bo` says `距离博哥退休还有`; the section title says `动态`; Lighthouse data prioritizes product capability signals over sales discounts.
- Verification: Refresh Lighthouse data, inspect JSON for Hermes Agent and absence of generic new-user discounts, run Astro build, browser-check `/bo`, run `pnpm agent:lint`.
- Docs Sync: Update docs if the scraping policy changes.
- Safety: Read public Tencent Cloud page only; no production writes or deploy actions.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Actions

- Created task record.
- Updated scraper scoring to prefer AI Agent, one-click deployment, beta, product experience, and best-practice signals.
- Added contextual title extraction for CTA-only links such as `即刻上手`, preserving nearby text like `Lighthouse独家支持Hermes Agent一键部署`.
- Changed `/bo` visible copy to `距离博哥退休还有` and `动态`.
- Refreshed Lighthouse data from the public Tencent Cloud source page.
- Archived this record after verification.

## Decisions and Assumptions

- Use `动态` externally; avoid formal labels such as `业绩`.
- Treat AI Agent, one-click deployment, public beta, best practice, and product experience as stronger signals than pricing promotions.

## Files Touched

- `apps/frontend-astro/scripts/update-lighthouse-news.mjs`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`
- `apps/frontend-astro/src/data/lighthouse-activities.json`
- `docs/agent/FRONTEND_DEBUG.md`
- `.agents/tasks/archive/2026-05-04-lighthouse-signal-copy.md`

## Verification Evidence

- `pnpm -C apps/frontend-astro update:lighthouse-news`: passed and wrote 3 capability-focused links.
- JSON inspection: includes `Lighthouse独家支持Hermes Agent一键部署`; excludes generic new-user discount and opening-year promotion entries.
- `pnpm -C apps/frontend-astro build`: passed. Local Sentry source map upload skipped because no auth token was provided.
- Browser `/bo`: showed `距离博哥退休还有`, section `动态`, and dynamic links for Hermes Agent, OpenClaw, and OrcaTerm; timestamp-filtered console logs were empty.
- `pnpm agent:lint`: passed with `agent-lint: ok`.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-05-04-lighthouse-signal-copy.md`
