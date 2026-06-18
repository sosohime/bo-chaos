# Task Record: miniapp retire progress console

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve retirement date constants, countdown calculation, one-second refresh, copy-to-clipboard, and kowtow navigation.
- Visual: Make the retirement progress area read as a time-resource status surface, not a decorative progress strip.
- Data: Use only `tuixiu` constants and computed countdown values. Do not add hard-coded retirement-rule copy or fake metrics.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Design Diagnosis

- Screen job: show the current retirement countdown, progress through the configured cycle, and next actions.
- First state/action: remaining days and cycle progress should be readable as real time-resource state.
- Data source: start/target dates come from `@mono/const/tuixiu`; percentages are computed from those dates.
- Current issue: the progress strip is visually separate from the resource rows and reads slightly decorative.
- Tencent Cloud pattern: compact monitoring row with status chip, metric labels, and a precise progress rail.

## Actions

- Reworked the retirement progress strip into a compact time-resource monitoring panel.
- Added a status chip, start/target scale cells, and completed/remaining metric cells driven by existing countdown values.
- Preserved the shared `@mono/const/tuixiu` start/target dates and one-second countdown refresh.

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed; the only match was the unrelated backend validator `apps/backend-nest/src/bofans/users/users.controller.ts:36: @MaxLength(48)`.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because this source-only visual refinement did not change durable agent docs; `apps/miniapp-taro/DESIGN.md` already covers retirement-page data honesty and console surfaces.
- WeChat DevTools / real-device screenshot verification was not available in this turn, so broad visual acceptance remains unproven.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-retire-progress-console.md`
