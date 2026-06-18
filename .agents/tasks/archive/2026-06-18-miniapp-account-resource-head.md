# Task Record: miniapp account resource head

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving mini app UI taste by refining the My page account header into a Tencent Cloud-style account resource strip.

## Acceptance Boundaries

- Functional: Preserve avatar selection/upload, nickname editing, refresh behavior, upload/history behavior, and UGC kill-switch behavior.
- Verification: Run mini app WeChat build, touched-file anti-slop scan, git diff whitespace check, and agent lint.
- Docs Sync: No L2 docs update unless this introduces a new shared convention or behavior contract.
- Safety: Do not change production API config, auth, runtime flags, user API behavior, upload API behavior, or history pagination.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, doc-sync, routing, conventions, quality, and workflow guidance.
- Reviewed My page account header TSX and SCSS.
- Diagnosis: the sticky account header preserves editing behavior but shows little real resource state, making the first screen feel thinner than the newer console panels below it.
- Added an account resource strip with real account runtime days, interaction count, and reviewer/member capability from `userInfo`.
- Updated the sticky account header chrome to match the compact console matrix language used elsewhere.
- Preserved avatar selection/upload, nickname editing, refresh behavior, upload/history behavior, and UGC kill-switch behavior.

## Iteration Log

- N/A

## Deferred Verification

- WeChat DevTools visual verification is unavailable from this shell session; source/build checks will be recorded.

## Decisions and Assumptions

- Use only real `userInfo` state for account metrics: join time, kowtow count, and reviewer capability.
- Keep the edit scoped to the account header and avoid changing API or upload behavior.
- No L2 docs update is needed because this is page-local visual polish, not a new behavior contract.

## Files Touched

- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-account-resource-head.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed. Existing Browserslist/caniuse-lite age warnings only.
- Touched-file anti-slop scan only matched existing avatar `48px` dimensions, not forbidden copy or fake metrics.
- Diff-only anti-slop scan only matched a hunk line-number false positive.
- `git diff --check` passed.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning; no docs update needed for page-local visual polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-account-resource-head.md`
