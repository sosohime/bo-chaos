# Task Record: miniapp photo command bar

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve image lazy loading, aspect-fill media boxes, preview, retry, download/save, vote/cancel vote, optimistic vote rollback, and in-review visibility.
- Visual: Make the photo card action area read as a compact resource command bar instead of floating social buttons.
- Data: Use only existing photo fields and vote count. Do not add fake metrics, diagnostics, or inferred totals.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Design Diagnosis

- Screen job: preview a loaded photo resource and run one or two concrete commands.
- First state/action: media should dominate; commands should be stable, compact, and understandable.
- Data source: title/category/vote count come from `PhotoDto`; vote action is visible only through existing `systemConfig.inReview`.
- Current issue: action controls are visually separate mini-buttons and can read like a social card footer.
- Tencent Cloud pattern: low-height command strip with clear action cells and quiet metadata.

## Actions

- Rewrapped the save and review vote controls into a compact photo command group.
- Added a quiet `命令` row label and shortened the save command copy from `保存图片` to `保存`.
- Restyled the command controls as connected cells with one border, preserving vote count and active/disabled states.

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed; the only match was the unrelated backend validator `apps/backend-nest/src/bofans/users/users.controller.ts:36: @MaxLength(48)`.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because this source-only component refinement did not change durable agent docs; `apps/miniapp-taro/DESIGN.md` already covers compact resource card commands.
- WeChat DevTools / real-device screenshot verification was not available in this turn, so broad visual acceptance remains unproven.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-command-bar.md`
