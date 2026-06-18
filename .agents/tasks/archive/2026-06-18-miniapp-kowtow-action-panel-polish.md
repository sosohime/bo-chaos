# Task Record: Miniapp Kowtow Action Panel Polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue tightening the kowtow action panel toward a Tencent Cloud task-console interaction surface.

## Acceptance Boundaries

- Functional: Replace slogan-like kowtow action panel heading with task-operation metadata while preserving click handling, local count queue, batching, sync retry, canvas pulse, swiper, and review-mode behavior.
- Verification: Run mini app WeChat build and `pnpm agent:lint`.
- Docs Sync: Agent docs unaffected unless conventions, commands, routing, or architecture change.
- Safety: No API, production target, secret, data mutation, runtime config, or kowtow endpoint changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and visual-design skills.
- Audited the kowtow action panel and found the heading still used slogan-like copy.
- Replaced the slogan heading with a `LOCAL OPERATION` metadata header, neutral `今日操作` title, and queue-derived state chip.
- Preserved click handling, local count queue, batching, sync retry, canvas pulse, swiper, and review-mode behavior.

## Iteration Log

- Targeting the primary interaction panel because it is the main repeated action surface.

## Deferred Verification

- WeChat DevTools visual verification may be unavailable in this terminal pass; record status before archive.

## Decisions and Assumptions

- Keep the business action label on the button, but make the panel heading a neutral operation label.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-kowtow-action-panel-polish.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`

## Verification Evidence

- `pnpm exec prettier --write apps/miniapp-taro/src/pages/kowtow/index.tsx apps/miniapp-taro/src/pages/kowtow/index.scss .agents/tasks/active/2026-06-18-miniapp-kowtow-action-panel-polish.md`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed. Warnings only: stale Browserslist data and Node `punycode` deprecation.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no conventions changed, so docs update is not needed.
- `git diff --check`: passed.
- WeChat DevTools visual verification was not available in this terminal pass.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-action-panel-polish.md`
