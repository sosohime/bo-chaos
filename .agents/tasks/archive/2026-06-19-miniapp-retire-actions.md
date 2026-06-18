# Task Record: miniapp retire actions

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Refine the retirement page command area into a console-style action list while preserving countdown constants, copy action, and kowtow navigation.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change retirement date math, shared constants, page routes, production API target, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed the retirement page and identified the two-column command area as a remaining card-like action pattern.
- Changed `.retire-console-actions` from a two-column tile grid into a vertical console command list with a white surface, thin border, and row dividers.
- Preserved the existing copy action, kowtow navigation, countdown constants, and retirement date math.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification unless DevTools becomes available.

## Decisions and Assumptions

- Screen job: show canonical retirement countdown state and provide copy/interaction follow-up actions.
- Primary state: countdown facts and progress remain above the action area.
- Source of truth: shared retirement constants and current countdown state.
- Removal target: side-by-side command cards that feel like promotional tiles.
- Closest Tencent Cloud pattern: compact command list with clear row targets.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-retire-actions.md`
- `apps/miniapp-taro/src/pages/retire/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro emitted existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Targeted retire anti-slop scan for fake AI/marketing copy, hard-coded retirement labels, and old two-column command grid: no matches.
- Broad touched miniapp anti-slop scan for fake AI/marketing copy, hard-coded retirement labels, stale image/load copy, old color tokens, and forbidden glow/gradient terms: no matches.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; source-only visual polish did not require `docs/agent/CONVENTIONS.md` changes.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-retire-actions.md`
