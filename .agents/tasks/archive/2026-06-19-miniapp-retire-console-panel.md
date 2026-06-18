# Task Record: miniapp retire console panel

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the retirement miniapp homepage toward a Tencent Cloud product-console style without changing the canonical retirement countdown logic.

## Acceptance Boundaries

- Functional: Refine the retirement page visual hierarchy while preserving countdown calculation, shared retirement constants, copy-to-clipboard, kowtow navigation, and share config.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers the retirement panel pattern or update docs if a durable new rule is introduced.
- Safety: Do not hard-code employment rules, change retirement constants, alter tab routing, change production API target, or add fake metrics.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected retirement page TSX and SCSS.
- Confirmed countdown facts are derived from `@mono/const` retirement constants and runtime time state.
- Identified the remaining decorative rail and oversized first-screen scale as the target.
- Removed the retirement console decorative rail.
- Reduced retirement title, remaining-day number, clock, progress bar, and panel-title scale.
- Preserved countdown calculation, copy action, kowtow navigation, share config, and date/progress data sources.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: show the canonical retirement countdown and the next two actions without looking like a campaign page.
- Primary state: remaining days, clock, target node, and completion progress.
- Source of truth: `tuixiu.boTuiXiuStartDay`, `tuixiu.boTuiXiuDay`, and current time.
- Removal target: decorative rail and oversized countdown typography.
- Closest Tencent Cloud pattern: time-resource summary with progress and configuration rows.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-retire-console-panel.md`
- `apps/miniapp-taro/src/pages/retire/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `git diff --check` passed.
- Anti-slop scan on retirement TSX/SCSS found no banned marketing/AI/fake-count/old-retirement/rail terms.
- `pnpm agent:lint` passed with `miniapp-doc-sync` warning; no docs update needed because `apps/miniapp-taro/DESIGN.md` already covers retirement data honesty and compact console panels.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-retire-console-panel.md`
