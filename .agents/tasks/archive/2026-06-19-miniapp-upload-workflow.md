# Task Record: miniapp upload workflow

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Replace the upload step block grid with an honest compact workflow list that preserves the existing upload stage logic and does not change upload behavior.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change upload API behavior, upload concurrency, production API source targets, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed the upload page section and identified the four-cell step grid as a remaining dashboard-like visual primitive.
- Added a data-driven `uploadWorkflowSteps` list for board, category, image, and review states.
- Replaced the equal-width upload step blocks with compact process rows containing stable sequence, label, and status chip columns.
- Kept every workflow state derived from the existing selected board/category/image queue and upload summary values.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn will rely on build and source/style verification unless DevTools becomes available.

## Decisions and Assumptions

- Screen job: guide the user through a recoverable upload workflow.
- Primary state: the current upload stage remains visible in the upload summary above the workflow.
- Source of truth: selected board/category, selected image count, and upload summary success state.
- Removal target: the `upload-steps` equal-width block grid.
- Closest Tencent Cloud pattern: compact process/resource checklist with explicit row states.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-upload-workflow.md`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across My, approval, kowtow, retirement, shared photo browser, and custom tab bar source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-upload-workflow.md`
