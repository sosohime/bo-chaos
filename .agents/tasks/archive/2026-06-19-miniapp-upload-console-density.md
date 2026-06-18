# Task Record: miniapp upload console density

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud-style product console by reducing card stacking and tightening the upload surface.

## Acceptance Boundaries

- Functional: Preserve upload selection, category creation, queue submission, review navigation, lazy image previews, runtime config labels, and UGC kill switch behavior.
- Visual: Make upload summary, workflow, form, and queue feel like one compact operational surface instead of multiple decorative cards.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if the change introduces a durable visual convention not already covered by `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected `pages/my` upload TSX/SCSS and identified the summary, workflow, form, and image queue as visually over-separated.
- Reworked upload summary and workflow into a connected console panel instead of two stacked cards.
- Tightened upload form rows into compact label/value configuration rows while preserving picker/input behavior.
- Tightened image queue chrome so previews sit in the same product surface language without changing lazy loading or preview behavior.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: submit photo resources into the review queue.
- Primary state: selected board/category, queue size, upload stage, and submit action.
- Source of truth: selected image queue, category state, runtime miniapp config, upload constants, and upload API behavior remain unchanged.
- Removal target: stacked big-card rhythm that makes the page feel more like a generic app template than a compact product console.
- Closest Tencent Cloud pattern: resource configuration panel with compact summary rows, status list, and action footer.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-upload-console-density.md`
- `apps/miniapp-taro/src/pages/my/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data warning.
- `git diff --check` passed.
- Focused anti-slop scan found only unrelated backend `@MaxLength(48)` validation after removing the temporary `48px` style hit.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers compact console surfaces and stable tab/list states, so no conventions doc change was needed.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-upload-console-density.md`
