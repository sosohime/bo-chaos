# Task Record: miniapp category resource rows

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: Preserve category expand/collapse, photo preview, lazy image behavior, pagination footer, and retry states.
- Visual: Make category rows read as resource rows with concrete item counts and state, not generic expand cards.
- Data: Use only `group.photos.length`, active category state, and existing loading/hasMore state. Do not infer backend totals from loaded images or change tab totals.
- Verification: Build the WeChat mini app, run `git diff --check`, run the focused anti-slop scan, and run `pnpm agent:lint`.
- Archive: Move this record to `.agents/tasks/archive/` when complete or handed off.

## Design Diagnosis

- Screen job: choose a category group, understand whether it is open, and preview loaded photo resources.
- First state/action: the active group and its loaded resource count should be visible before the grid.
- Data source: category row count is the visible loaded `group.photos.length`; global totals remain untouched.
- Current issue: rows say only "分组" and "展开/收起", which feels generic and less operational.
- Tencent Cloud pattern: resource list rows with name, count, and state chip.

## Actions

- Added a visible loaded-item count to each category resource row using `group.photos.length`.
- Changed expanded group header from a generic sync label to `当前分组 / N 项`.
- Added quiet metadata styling for the loaded count while preserving stable expand/collapse controls.

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode warnings.
- `git diff --check` passed.
- Focused anti-slop scan passed; the only match was the unrelated backend validator `apps/backend-nest/src/bofans/users/users.controller.ts:36: @MaxLength(48)`.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because this source-only visual refinement did not change durable agent docs; `apps/miniapp-taro/DESIGN.md` already covers honest lazy-loaded list counts and resource rows.
- WeChat DevTools / real-device screenshot verification was not available in this turn, so broad visual acceptance remains unproven.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-category-resource-rows.md`
