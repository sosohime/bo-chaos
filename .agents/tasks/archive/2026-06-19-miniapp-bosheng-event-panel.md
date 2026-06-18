# Task Record: miniapp bosheng event panel

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by refining the shared BoSheng event component.

## Acceptance Boundaries

- Functional: Convert the shared BoSheng birthday event surface from a rail/grid card into a compact console-style event panel while preserving `isBoSheng()` visibility behavior and existing call sites.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers this component direction or update docs if a durable new rule is introduced.
- Safety: Do not change birthday date logic, routes, runtime config, production API target, secrets, UGC behavior, or call-site layout props.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected the shared `BoSheng` component and found a remaining left-rail plus three-column metadata grid pattern.
- Removed the decorative `bosheng-rail`.
- Reworked BoSheng metadata from three grid cells into compact metadata rows.
- Preserved `isBoSheng()` visibility behavior, birthday labels, and every existing call-site prop.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: when visible, BoSheng should communicate one runtime event without becoming a decorative banner.
- Primary state: event title and today's active status.
- Source of truth: visibility remains controlled by `isBoSheng()`.
- Removal target: ornamental left rail and stat-grid styling.
- Closest Tencent Cloud pattern: compact event/resource panel with metadata rows.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-bosheng-event-panel.md`
- `apps/miniapp-taro/src/components/boSheng/index.scss`
- `apps/miniapp-taro/src/components/boSheng/index.tsx`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro emitted existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- BoSheng anti-slop scan for fake AI/marketing copy, hard-coded retirement labels, stale image/load copy, old color tokens, forbidden glow/gradient terms, and removed `bosheng-rail`/`bosheng-meta-item` classes: no matches.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers compact resource/event panels and no new convention was introduced.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-bosheng-event-panel.md`
