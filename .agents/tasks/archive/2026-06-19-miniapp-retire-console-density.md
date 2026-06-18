# Task Record: miniapp retire console density

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp retirement homepage toward a Tencent Cloud-style product console while keeping countdown facts canonical.

## Acceptance Boundaries

- Functional: Preserve countdown source constants, second-level refresh, share copy, clipboard action, kowtow navigation, and progress calculation.
- Visual: Make the retirement first screen feel like a compact time resource console with connected state rows and stable clock slots, not stacked decorative cards.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if the change introduces a durable rule not already covered by `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected retirement page TSX/SCSS and retirement constant references.
- Confirmed retirement UI uses shared start/target constants and does not display hard-coded employment-rule copy.
- Structured the live clock into stable digit slots for a more precise time-resource display.
- Connected summary, runtime rows, and progress into one console-style state group instead of stacked cards.
- Tightened panel/action chrome with smaller radii, compact rows, and preserved action semantics.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: show current retirement countdown status and offer share/copy and interaction navigation.
- Primary state: remaining days, live time, target node, progress percent, and action results.
- Source of truth: `@mono/const` retirement dates and local countdown tick remain unchanged.
- Removal target: stacked card rhythm and loose clock text that make the first screen feel less like a precise product console.
- Closest Tencent Cloud pattern: resource status summary with connected detail rows, progress state, and action list.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-retire-console-density.md`
- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data warning.
- `git diff --check` passed.
- Focused anti-slop scan found only unrelated backend `@MaxLength(48)` validation; retirement UI did not introduce hard-coded `15年`, `48`, or fake progress copy.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers retirement constants and compact console surfaces, so no conventions doc change was needed.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-retire-console-density.md`
