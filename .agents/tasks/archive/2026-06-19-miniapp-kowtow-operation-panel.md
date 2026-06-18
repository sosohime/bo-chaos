# Task Record: miniapp kowtow operation panel

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving the mini app toward a Tencent Cloud-style product console with restrained tech feeling.

## Acceptance Boundaries

- Functional: Refactor the Kowtow interaction control area into a compact, truthful operation panel with clearer sync/queue state and a stable primary action.
- Verification: Run the miniapp WeChat build, focused anti-slop scan, `git diff --check`, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if agent docs are unaffected.
- Safety: Do not touch production, API base URLs, secrets, schema, auth, or backend behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record.
- Removed the duplicate command row and verbose queue footer from the Kowtow page.
- Rebuilt the interaction area as a compact operation panel with local queue, sync mode, today status, retry state, and a stable primary write button.
- Kept all values tied to existing API stats, local queue state, or the sync interval constant.

## Iteration Log

- User direction remains Tencent Cloud console fit plus credible AI/tech feeling without fake dashboards or decorative effects.

## Deferred Verification

- WeChat DevTools / real-device visual verification remains required for final visual acceptance if available.

## Decisions and Assumptions

- Screen job: let a user see current interaction totals and write one local interaction record.
- Primary state/action above the fold: sync health, local queue state, and the write action.
- Data sources: stats from `getKowtowStats`, queue count from local storage, sync interval from local constant.
- Removal target: duplicate command/footer copy that makes the screen feel noisy instead of operational.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-kowtow-operation-panel.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist stale-data and Node punycode deprecation warnings.
- Focused anti-slop scan: passed; only unrelated backend `apps/backend-nest/src/bofans/users/users.controller.ts:36 @MaxLength(48)` matched.
- `git diff --check`: passed.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because miniapp source changed without `docs/agent/CONVENTIONS.md`; no conventions update needed for this local page visual/interaction polish.
- WeChat DevTools / real-device visual verification: not run in this turn.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-kowtow-operation-panel.md`
