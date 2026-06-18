# Task Record: miniapp kowtow console density

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp interaction page toward a Tencent Cloud-style product console while preserving real sync and queue behavior.

## Acceptance Boundaries

- Functional: Preserve kowtow local queue, 2s sync, retry state, batch API calls, review-mode content, canvas feedback, swiper images, and share behavior.
- Visual: Connect the interaction status, stats, and action area into a compact resource panel, and make review mode use the same operational surface language.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if the change introduces a durable rule not already covered by `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected kowtow page TSX/SCSS and kowtow API wrapper.
- Identified separated status/stats/action blocks as visually noisier than the desired resource-console surface.
- Wrapped normal-mode status, stats, and write action into one connected console panel.
- Converted stats rows and review-mode rows into compact connected resource rows with the same panel language.
- Preserved API sync, local queue, canvas feedback, swiper image resource data, and review-mode content.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: show interaction sync state and let the user append to the local queue.
- Primary state: total count, today participant count, local queue state, sync interval, and write action.
- Source of truth: API stats, local queue, sync error state, and fixed sync interval remain unchanged.
- Removal target: separated card rhythm that makes the page feel more like an activity page than an operational console.
- Closest Tencent Cloud pattern: resource status panel with connected rows and a compact write action footer.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-kowtow-console-density.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data warning.
- `git diff --check` passed.
- Focused anti-slop scan found only unrelated backend `@MaxLength(48)` validation.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers compact status/resource surfaces, so no conventions doc change was needed.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-kowtow-console-density.md`
