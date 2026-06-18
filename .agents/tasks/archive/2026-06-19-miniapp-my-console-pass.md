# Task Record: miniapp my console pass

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app UI toward a Tencent Cloud-style product console with restrained AI/tech feeling.

## Acceptance Boundaries

- Functional: Preserve account loading, avatar editing, nickname editing, upload queue, UGC kill switch behavior, and upload history pagination.
- Visual: Tighten remaining legacy account/upload/history surfaces on the My page so they read as connected console resources rather than decorative cards.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if this introduces a durable rule beyond `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Audited `apps/miniapp-taro/src/pages/my/index.tsx` and `apps/miniapp-taro/src/pages/my/index.scss`.
- Identified residual cheapness from larger 8px radii, nested soft-blue resource blocks, upload result card chrome, and history grid/empty-state framing.
- Tightened account avatar, major My page panels, Bo daily metadata rows, upload result, and history grid/empty state to the shared 6px/connected-row console language.
- Preserved all TSX behavior and data sources; this pass only changes SCSS presentation.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: let a signed-in user manage account state, upload queue state, and recent submission history.
- Primary state: account resource summary, current upload stage, and current history queue state.
- Source of truth: user API data, runtime config, upload queue local state, upload history API totals, and shared constants.
- Removal target: legacy rounded-card styling that makes the page feel less like a product console.
- Closest Tencent Cloud pattern: account resource summary, upload queue, and compact status/resource list.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-my-console-pass.md`
- `apps/miniapp-taro/src/pages/my/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode deprecation warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed for miniapp touched area; the only remaining matched `48` is unrelated backend `@MaxLength(48)`.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning. No `docs/agent/CONVENTIONS.md` update needed because `apps/miniapp-taro/DESIGN.md` already covers compact console surfaces, connected rows, and avoiding decorative cards.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-my-console-pass.md`
