# Task Record: miniapp account console header

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve avatar upload, nickname edit, pull-to-refresh, UGC kill switch behavior, upload history, and all existing API calls.
- Visual: Make the personal page account header feel like a compact resource instance header, not a social profile card or marketing banner.
- Data: Use only `userInfo`, shared runtime config, and existing local state. Do not invent account scores, diagnostics, or AI claims.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Design Diagnosis

- Screen job: let the user identify their account, edit identity fields, and see current resource permissions before upload/history work.
- First state/action: account identity and permission state should be understood above the fold; avatar and nickname edits remain direct.
- Data source: resource id, role, run days, and kowtow count all come from `userInfo`; no value is inferred from lazy-loaded list content.
- Current issue: the header is partly console-like, but still reads as an avatar card plus a nested summary card.
- Tencent Cloud pattern: resource instance header with small id text, status chip, and compact key-value rows.

## Actions

- Added a stable `UID-*` resource id derived from `userInfo.id` and an explicit upload availability label derived from the UGC runtime switch.
- Rebuilt the account header as a resource instance header: avatar shell with direct change command, account title copy, role chip, and compact 2x2 key-value resource summary.
- Removed the nested primary summary block pattern from the account header so the first viewport reads less like a social profile card.

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed; the only match was the unrelated backend validator `apps/backend-nest/src/bofans/users/users.controller.ts:36: @MaxLength(48)`.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because this source-only visual refinement did not change durable agent docs; `apps/miniapp-taro/DESIGN.md` already covers the relevant account/resource-header rules.
- WeChat DevTools / real-device screenshot verification was not available in this turn, so broad visual acceptance remains unproven.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-account-console-header.md`
