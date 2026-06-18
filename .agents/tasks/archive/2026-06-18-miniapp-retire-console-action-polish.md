# Task Record: Miniapp Retire Console Action Polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console by tightening the retirement homepage panel labels and actions.

## Acceptance Boundaries

- Functional: Change only retire page presentation/copy; keep countdown constants, countdown math, progress calculation, share content, copy behavior, tab navigation, runtime config, and API targets unchanged.
- Verification: Build the WeChat mini app, run agent lint, and run whitespace checks.
- Docs Sync: No conventions update expected unless implementation changes a reusable engineering rule.
- Safety: Do not touch production config, secrets, deployment, backend APIs, data shapes, or retirement constants.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and mini app visual design skills.
- Checked current branch/worktree state.
- Inspected retire page TSX/SCSS and searched for retirement-rule/copy references.
- Tightened lower panel labels from generic resource copy to baseline/progress parameter copy.
- Renamed the visible action buttons to product-style actions.
- Removed WeChat default button pseudo-border for the retire action buttons.

## Iteration Log

- Design diagnosis: the page uses canonical countdown data, but the lower panel labels are generic and the secondary action copy feels game-like for the main retirement entry.
- Primary state/action: users need to read current retirement progress, copy the status, or move to the interaction page.
- Cheap/noisy elements to reduce: generic "resource detail" copy and WeChat default button border chrome.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable from this execution context.

## Decisions and Assumptions

- Do not expose internal retirement-rule math or edit constants.
- Keep the share copy unchanged because it is user-facing domain wording and does not affect the visible page layout.

## Files Touched

- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-retire-console-action-polish.md`

## Verification Evidence

- `pnpm exec prettier --write apps/miniapp-taro/src/pages/retire/index.tsx apps/miniapp-taro/src/pages/retire/index.scss .agents/tasks/active/2026-06-18-miniapp-retire-console-action-polish.md`: passed.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro compiled successfully with existing Browserslist staleness and Node `punycode` warnings.
- `pnpm agent:lint`: passed with the expected miniapp-doc-sync warning. `docs/agent/CONVENTIONS.md` is unchanged because this turn only adjusts retire page presentation/copy, not mini app engineering conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-console-action-polish.md`
