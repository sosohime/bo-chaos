# Task Record: miniapp approval state panels

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by refining approval queue headers and state panels.

## Acceptance Boundaries

- Functional: Remove decorative rails from approval queue header and empty/loading/error state panels while preserving queue tabs, refresh, pagination, preview, lazy images, and queue counts.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers this approval queue pattern or update docs if a durable new rule is introduced.
- Safety: Do not change upload history APIs, queue switching, refresh behavior, image preview, production API target, secrets, UGC behavior, or routes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected approval queue page and identified remaining decorative left rails in the queue header and approval state panels.
- Removed the approval queue header left rail and tightened its title scale.
- Removed the empty/loading/error state panel left rail.
- Reduced approval state panel height, glyph size, and title scale while keeping the panel readable.
- Moved the state divider into the compact resource-state row and preserved tabs, refresh, pagination, preview, lazy images, and queue counts.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: approval page should behave like a compact review queue console.
- Primary state: selected queue, total/count state, and retry/loading/empty state.
- Source of truth: existing upload history hooks and queue totals remain unchanged.
- Removal target: decorative queue header/state rails and oversized empty-state hierarchy.
- Closest Tencent Cloud pattern: queue header with status chip plus compact empty/loading/error resource state.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-approval-state-panels.md`
- `apps/miniapp-taro/src/pages/approve/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `git diff --check` passed.
- Anti-slop scan on `apps/miniapp-taro/src/pages/approve/index.scss` and `apps/miniapp-taro/src/pages/approve/index.tsx` found no banned marketing/AI/fake-count/rail terms for this change.
- `pnpm agent:lint` passed with `miniapp-doc-sync` warning; no docs update needed because `apps/miniapp-taro/DESIGN.md` already covers compact queue/resource state patterns and this change adds no new convention.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-approval-state-panels.md`
