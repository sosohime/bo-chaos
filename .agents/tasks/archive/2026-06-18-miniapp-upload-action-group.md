# Task Record: miniapp upload action group polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app upload form toward Tencent Cloud console quality with stable primary actions.

## Acceptance Boundaries

- Functional: The upload form add/submit actions should become one compact operation group, while preserving handlers, disabled/loading state, queue submission, and image selection behavior.
- Verification: Run mini app WeApp build with production API base, `git diff --check`, anti-slop scans on touched files, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if source-only UI structure polish does not require L2 doc changes.
- Safety: Do not change upload logic, category state, retry behavior, UGC kill-switch behavior, production API targets, auth, or queue state.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Read mini app, mini app visual design, doc sync skills, and relevant agent docs.
- Inspected the My page upload form TSX and SCSS around add/submit actions.
- Wrapped the two upload action buttons in a local action group while preserving all handlers and disabled/loading conditions.
- Reworked the action SCSS into a compact console command group with stable primary/secondary treatment.

## Iteration Log

- This pass targets the upload form's main operation row, aligning it with the recently refined post-submit command group.

## Deferred Verification

- WeChat DevTools or real-device visual inspection remains required for final broad UI acceptance.

## Decisions and Assumptions

- A tiny TSX wrapper is acceptable here because it is required to make the two existing buttons function as one stable command group.
- No generated bitmap slice was added because the target is a native form operation pattern.
- No L2 agent docs need updates because no convention, command, architecture, data contract, or workflow rule changed.

## Files Touched

- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-upload-action-group.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully, with existing Browserslist staleness warnings.
- `git diff --check`: passed.
- Anti-slop scan on touched files: only hit existing `48px` dimensions in source SCSS; no fake AI, marketing, glow, gradient, hard-coded retirement-rule copy, or banned copy patterns were added.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; docs unchanged because this is UI structure/style polish and no conventions changed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-upload-action-group.md`
