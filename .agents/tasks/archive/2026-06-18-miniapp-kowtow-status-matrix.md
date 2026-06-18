# Task Record: Miniapp Kowtow Status Matrix

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue the Tencent Cloud inspired miniapp UI refactor by making the kowtow interaction page expose real sync and queue state as a compact console matrix.

## Acceptance Boundaries

- Functional: Preserve kowtow animation, local queue persistence, polling sync, stats fetch, review-mode fallback, and share behavior.
- Verification: Run miniapp WeChat build, agent lint, and whitespace diff check.
- Docs Sync: No L2 docs expected unless conventions or app behavior change.
- Safety: Do not touch production targets, secrets, backend APIs, schema, or deployment.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Loaded miniapp, miniapp visual design, and doc sync skills.
- Confirmed worktree is clean on `codex/miniapp-tech-refactor`.
- Audited the kowtow page status surface and found real state hidden in a low-emphasis row.
- Extracted the kowtow polling interval into `KOWTOW_SYNC_INTERVAL_MS`.
- Converted the kowtow status body into a 2x2 console matrix: cumulative records, today's users, local queue, and sync cycle.
- Removed the weaker standalone local queue row.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools or real-device screenshot acceptance remains deferred because this environment does not expose the user's scanned DevTools session for reliable screenshot capture.

## Decisions and Assumptions

- Show only real values: API stats, local queue count, and the actual polling interval constant.
- Keep copy operational and avoid invented AI diagnosis or dashboard claims.
- `docs/agent/CONVENTIONS.md` does not need a change because this is source-only page UI structure polish, not a reusable engineering convention change.

## Files Touched

- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-kowtow-status-matrix.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro build compiled successfully with existing Browserslist staleness warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; reviewed and left `docs/agent/CONVENTIONS.md` unchanged because this is source-only page UI polish.
- `git diff --check`: passed with no whitespace errors.
- Source scan for fake metrics and marketing/AI terms in the touched kowtow page: no matches beyond the real polling constant and operational labels.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-status-matrix.md`
