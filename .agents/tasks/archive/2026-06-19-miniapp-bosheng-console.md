# Task Record: miniapp BoSheng console

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the shared birthday event component toward a Tencent Cloud-style product console.

## Acceptance Boundaries

- Functional: Preserve `isBoSheng()` visibility, event copy, all consuming pages, and caller-provided wrapper styles.
- Visual: Make the shared birthday event read as a compact connected runtime-event panel instead of a nested card.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if the change introduces a durable rule not already covered by `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected `BoSheng` component styles and its use across history, travel, my, kowtow, and tease pages.
- Identified the nested meta card as heavier than the desired compact runtime-event surface.
- Reworked the shared BoSheng birthday event into a connected runtime-event panel.
- Removed nested meta-card chrome while preserving event rows, `isBoSheng()`, copy, and all consuming pages.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: surface a birthday runtime event only on the relevant day.
- Primary state: event type, period, and visibility state.
- Source of truth: `isBoSheng()` and static event labels remain unchanged.
- Removal target: nested meta-card chrome.
- Closest Tencent Cloud pattern: runtime event/status panel with compact rows.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-bosheng-console.md`
- `apps/miniapp-taro/src/components/boSheng/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode deprecation warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed for miniapp touched area; the only remaining matched `48` is unrelated backend `@MaxLength(48)`.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning. No `docs/agent/CONVENTIONS.md` update needed because `apps/miniapp-taro/DESIGN.md` already covers shared runtime/status panels, compact console surfaces, and avoiding nested decorative cards.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-bosheng-console.md`
