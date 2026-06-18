# Task Record: miniapp UGC disabled console

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving shared miniapp disabled/hidden UGC states toward a Tencent Cloud-style product console.

## Acceptance Boundaries

- Functional: Preserve runtime UGC kill switch behavior, disabled title/message source, hidden upload/photo/history/review entry behavior, and all consuming pages.
- Visual: Make the shared disabled state read as a compact runtime-configuration panel instead of a placeholder card nested with another card.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if the change introduces a durable rule not already covered by `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected `UgcDisabledState` usage across history, travel, upload, tease, and approval pages.
- Identified the nested summary card as visually heavier than the desired runtime-configuration state.
- Reworked the shared disabled-state shell into a connected runtime-configuration panel.
- Removed nested summary-card chrome while preserving title/message/status rows and runtime copy.
- Preserved all consuming pages and UGC kill switch behavior.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: explain that UGC/photo/upload surfaces are hidden by runtime config and give the user a stable state instead of a broken page.
- Primary state: UGC content entry is hidden, related requests are paused, and restoration is configuration-driven.
- Source of truth: runtime config title/message and UGC visibility behavior remain unchanged.
- Removal target: nested card feel and placeholder-like disabled state.
- Closest Tencent Cloud pattern: disabled resource/configuration state with compact connected rows.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-ugc-disabled-console.md`
- `apps/miniapp-taro/src/features/photos/ugc-disabled-state.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data warning.
- `git diff --check` passed.
- Focused anti-slop scan found only unrelated backend `@MaxLength(48)` validation.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers hidden UGC states and compact console surfaces, so no conventions doc change was needed.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-ugc-disabled-console.md`
