# Task Record: miniapp retire command panel

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the mini app toward Tencent Cloud console taste by improving the retirement page action area.

## Acceptance Boundaries

- Functional: Preserve countdown math, shared retirement constants, copy-to-clipboard behavior, kowtow navigation, share config, and page routing.
- Verification: Run mini app WeChat build, touched-file anti-slop scan, git diff whitespace check, and agent lint.
- Docs Sync: No L2 docs update unless this introduces a new shared convention or behavior contract.
- Safety: Do not change production API config, auth, runtime flags, shared retirement constants, or expose retirement rule details in copy.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, doc-sync, routing, conventions, quality, and workflow guidance.
- Reviewed retirement page TSX and SCSS.
- Diagnosis: the countdown and runtime matrix are aligned with the console direction, but the bottom actions still look like generic mini app buttons instead of product-console commands.
- Replaced the plain two-button footer with a compact command panel and command cells.
- Added clear command titles and outcomes for copy and interaction navigation without exposing retirement rule details.
- Preserved countdown math, shared constants, copy-to-clipboard behavior, kowtow navigation, share config, and page routing.

## Iteration Log

- N/A

## Deferred Verification

- WeChat DevTools visual verification is unavailable from this shell session; source/build checks will be recorded.

## Decisions and Assumptions

- Keep the edit scoped to action-area structure and styles; do not alter countdown logic or shared constants.
- No L2 docs update is needed because this is page-local visual polish, not a new behavior contract.

## Files Touched

- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-retire-command-panel.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed. Existing Browserslist/caniuse-lite age warnings only.
- Touched-file anti-slop scan only matched an existing `min-width: 48px` layout value, not forbidden copy or fake metrics.
- Diff-only anti-slop scan only matched a git index line, not source content.
- `git diff --check` passed.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning; no docs update needed for page-local visual polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-command-panel.md`
