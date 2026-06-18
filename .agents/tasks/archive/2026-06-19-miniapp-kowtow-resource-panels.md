# Task Record: miniapp kowtow resource panels

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the kowtow miniapp page toward a Tencent Cloud product-console style while preserving interaction behavior and real stats.

## Acceptance Boundaries

- Functional: Remove decorative rails and tighten kowtow/review/image resource panels while preserving stats sync, local queue writes, canvas feedback, swiper behavior, review-mode content, and API calls.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers kowtow/account compact stats or update docs if a durable new rule is introduced.
- Safety: Do not change kowtow API calls, sync interval, runtime review switch, animation behavior, production API target, secrets, routes, or stats sources.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected kowtow TSX and SCSS.
- Identified decorative left rails in the status header, image resource panel, and review panel.
- Confirmed displayed numbers/statuses come from API stats, local queue state, constants, or visible swiper state.
- Removed decorative rails from the normal status header, image resource panel, and review-mode panel.
- Reduced title, aggregate count, and image resource title scale to match the compact console direction.
- Preserved stats sync, local write action, canvas feedback, swiper resource counts, and review-mode content.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: show interaction sync state, write one local interaction, and inspect the current image resource.
- Primary state: sync health, total count, local queue, and primary write action.
- Source of truth: `getKowtowStats`, `kowtowCount`, `KOWTOW_SYNC_INTERVAL_MS`, and current swiper index.
- Removal target: decorative blue rails and oversized panel typography.
- Closest Tencent Cloud pattern: resource status summary plus operation footer and media resource detail.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-kowtow-resource-panels.md`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `git diff --check` passed.
- Anti-slop scan on kowtow TSX/SCSS found no banned marketing/AI/fake-count/old-retirement/rail terms.
- `pnpm agent:lint` passed with `miniapp-doc-sync` warning; no docs update needed because `apps/miniapp-taro/DESIGN.md` already covers kowtow/account compact stats and resource panels.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-kowtow-resource-panels.md`
