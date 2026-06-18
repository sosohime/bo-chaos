# Task Record: miniapp approval resource list

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Rework the approval image list from a two-column card grid into a compact resource list while preserving lazy image preview, queue totals, and UGC kill switch behavior.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change API fetching, pagination, production API target, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed the approval page and identified the two-column approval card grid as less aligned with a resource queue.
- Replaced `approval-grid`/`approval-card` markup with a single-column `approval-list` and `approval-row` resource layout.
- Preserved `Image lazyLoad`, image preview URLs, queue status chips, resource ids, pagination, and UGC kill switch behavior.
- Renamed the remaining card-specific id class to `approval-resource-id` so the source vocabulary matches the resource-list UI.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification unless DevTools becomes available.

## Decisions and Assumptions

- Screen job: let the user inspect upload review resources and switch between pending and approved queues.
- Primary state: active queue state and total remain in the existing summary.
- Source of truth: upload history API items, totals, loading/error/hasMore flags, and current queue tab.
- Removal target: the two-column `approval-grid`/`approval-card` visual.
- Closest Tencent Cloud pattern: resource list with thumbnail, name, metadata, state chip, and resource id.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-approval-resource-list.md`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across My, approval, kowtow, retirement, history, travel, tease, shared photo browser, and custom tab bar source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-approval-resource-list.md`
