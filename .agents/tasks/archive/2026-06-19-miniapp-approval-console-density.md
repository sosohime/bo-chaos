# Task Record: miniapp approval console density

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp approval queue toward a Tencent Cloud-style product console with honest queue data.

## Acceptance Boundaries

- Functional: Preserve upload history hooks, pending/approved tabs, total counts, refresh/load-more behavior, lazy images, preview behavior, and UGC kill switch behavior.
- Visual: Connect queue status and summary rows into one operational panel and tighten the approval list/resource rows.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if the change introduces a durable rule not already covered by `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected approval page TSX/SCSS and current queue summary/list structure.
- Identified separated queue header and summary card as visually noisier than the desired compact resource queue surface.
- Wrapped the queue header and summary rows into a connected `approval-console-panel`.
- Converted summary rows into compact connected queue rows while preserving true totals and visible-item counts.
- Tightened approval list row spacing, thumbnail size, and panel chrome without changing lazy image preview behavior.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: inspect pending/approved uploaded-photo queues and preview queue resources.
- Primary state: active queue, queue stage, visible item count, total counts, and list footer state.
- Source of truth: upload history hook totals/items/loading/error states remain unchanged.
- Removal target: disconnected header/summary cards and oversized list chrome.
- Closest Tencent Cloud pattern: queue status panel with compact summary rows and resource list.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-approval-console-density.md`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data warning.
- `git diff --check` passed.
- Focused anti-slop scan found only unrelated backend `@MaxLength(48)` validation after removing the temporary `48px` style hit.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers approval/upload queue surfaces, so no conventions doc change was needed.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-approval-console-density.md`
