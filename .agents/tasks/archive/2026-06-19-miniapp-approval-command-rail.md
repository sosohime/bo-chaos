# Task Record: miniapp approval command rail

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving the mini app toward a Tencent Cloud-style product console with restrained tech feeling.

## Acceptance Boundaries

- Functional: Refine the approval queue refresh action into a clearer primary command rail while preserving refresh, pagination, lazy image loading, and UGC gating behavior.
- Verification: Run the miniapp WeChat build, focused anti-slop scan, `git diff --check`, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if agent docs are unaffected.
- Safety: Do not touch production, API base URLs, secrets, schema, auth, backend behavior, or upload/review security behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record.
- Replaced the generic approval queue operation label with a primary task rail.
- Added truthful queue metadata driven by active queue error/hasMore state and active tab label.
- Preserved refresh, pagination, lazy images, preview, and UGC disabled behavior.

## Iteration Log

- User direction remains Tencent Cloud console fit plus credible AI/tech feeling without fake dashboards or decorative effects.

## Deferred Verification

- WeChat DevTools / real-device visual verification remains required for final visual acceptance if available.

## Decisions and Assumptions

- Screen job: review current upload queues and refresh/sync their state.
- Primary state/action: current queue, queue stage, pagination state, and refresh action.
- Data source: upload history hook state (`loading`, `error`, `hasMore`, `total`, items) and active tab.
- Removal target: generic queue operation label that does not read as a product-console primary task rail.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-approval-command-rail.md`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist stale-data and Node punycode deprecation warnings.
- Focused anti-slop scan: passed; only unrelated backend `apps/backend-nest/src/bofans/users/users.controller.ts:36 @MaxLength(48)` matched.
- `git diff --check`: passed.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because miniapp source changed without `docs/agent/CONVENTIONS.md`; no conventions update needed for this local page visual/interaction polish.
- WeChat DevTools / real-device visual verification: not run in this turn.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-approval-command-rail.md`
