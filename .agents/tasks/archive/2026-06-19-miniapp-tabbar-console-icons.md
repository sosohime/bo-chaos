# Task Record: miniapp tab bar console icons

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app UI toward a Tencent Cloud-style product console with more credible tech taste.

## Acceptance Boundaries

- Functional: Replace mismatched tab PNG icon states with stable code-rendered tab symbols and a restrained console-style active state.
- Verification: Run the miniapp WeChat build, focused anti-slop scan, `git diff --check`, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if agent docs are unaffected.
- Safety: Do not touch production, API base URLs, secrets, schema, or UGC behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record.
- Replaced custom tab bar PNG icon switching with a single code-rendered symbol structure per tab.
- Restyled the tab bar as a white console navigation surface with stable icon size, 2px selected indicator, quiet inactive gray-blue, and restrained active blue.

## Iteration Log

- User direction remains Tencent Cloud console fit plus restrained AI/tech feeling, with better tab active/inactive styling.

## Deferred Verification

- WeChat DevTools / real-device visual verification remains required for final visual acceptance if available.

## Decisions and Assumptions

- Treat tab bar as a shared visual primitive. A code-rendered icon system is less likely to drift in weight, color, and active sizing than separate PNG assets.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-tabbar-console-icons.md`
- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`

## Verification Evidence

- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist stale-data and Node punycode deprecation warnings.
- Focused anti-slop scan: passed; only unrelated backend `apps/backend-nest/src/bofans/users/users.controller.ts:36 @MaxLength(48)` matched.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because miniapp source changed without `docs/agent/CONVENTIONS.md`; no conventions update needed for this local visual primitive polish.
- WeChat DevTools / real-device visual verification: not run in this turn.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-console-icons.md`
