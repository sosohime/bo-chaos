# Task Record: miniapp bosheng event strip

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve the birthday-only visibility controlled by `isBoSheng()` and do not change date constants.
- Visual: Replace the birthday-only full card with a compact operational event strip that does not split the first viewport like a banner.
- Data: Use only the existing birthday condition; do not invent scores, diagnostics, or fake AI claims.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Design Diagnosis

- Screen job: birthday state is a rare runtime event, not a primary resource card.
- First state/action: the user should see that a date event is active without losing the account and daily resource hierarchy.
- Data source: visibility comes from `isBoSheng()`; event labels are static descriptions of that boolean state.
- Current issue: the event renders as a full nested card between account and daily resource panels.
- Tencent Cloud pattern: compact event/status strip rather than a celebratory banner.

## Actions

- Replaced the birthday-only full card layout with a compact operational event strip.
- Removed the three-row event meta table and kept a single marker, event label, and status value.
- Tightened the personal-page `BoSheng` wrapper spacing so the rare event no longer reads as a banner between account and daily resource surfaces.

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed; the only match was the unrelated backend validator `apps/backend-nest/src/bofans/users/users.controller.ts:36: @MaxLength(48)`.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because this source-only component refinement did not change durable agent docs; `apps/miniapp-taro/DESIGN.md` already covers compact operational event/state surfaces.
- WeChat DevTools / real-device screenshot verification was not available in this turn, so broad visual acceptance remains unproven.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-bosheng-event-strip.md`
