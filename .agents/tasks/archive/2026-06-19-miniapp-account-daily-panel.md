# Task Record: miniapp account daily panel

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by refining the account daily panel.

## Acceptance Boundaries

- Functional: Convert the `我的` page Bo Daily area from a promotional content card into a compact console-style resource panel while preserving all API-driven text and stats.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers this visual direction or update docs if a durable new rule is introduced.
- Safety: Do not change account APIs, upload flow, UGC kill switch behavior, production API target, secrets, or tab routes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected `我的` page first-screen/account area and identified Bo Daily as a remaining content-card pattern.
- Renamed the Bo Daily surface from `bo-daily-card` to `bo-daily-panel`.
- Reworked Bo Daily markup into a compact resource panel with a head row, date/theme metadata rows, body text, and true API-backed counters.
- Removed the ornamental left accent bar and stat tile grid from Bo Daily while preserving all API-driven text and stats.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: account page should show identity, current resource state, and upload/history actions without marketing-card composition.
- Primary state: user account state remains sticky; Bo Daily should become secondary resource context.
- Source of truth: Bo Daily values remain API-driven through `getBoDailyCard`.
- Removal target: large daily content-card hierarchy and ornamental stat tiles.
- Closest Tencent Cloud pattern: compact resource detail panel with metadata rows and true counters.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-account-daily-panel.md`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/pages/my/index.tsx`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro emitted existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- `我的` page anti-slop scan for fake AI/marketing copy, hard-coded retirement labels, stale image/load copy, old color tokens, forbidden glow/gradient terms, and old `bo-daily-card` class: no matches.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers this resource-panel direction and no new convention was introduced.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-account-daily-panel.md`
