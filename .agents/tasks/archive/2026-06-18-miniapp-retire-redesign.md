# Task Record: miniapp retire redesign

- State: completed
- Mode: full
- Started: 2026-06-18
- Completed: 2026-06-18
- Branch: main
- Request: 底部图标不对；把博退休放到小程序；不考虑保留目前信息架构，整体设计得更好。

## Acceptance Boundaries

- Functional: add a first-class miniapp retirement page, redesign primary tab structure, and replace inconsistent bottom icons with cohesive assets.
- Verification: run `pnpm -C apps/miniapp-taro build:weapp`, run `pnpm agent:lint`, and check WeChat DevTools where available.
- Safety: no production writes, no upload/review actions, no API target hard-coding.
- Archive: move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record.
- Added `pages/retire` as the first-class mini app home tab.
- Reworked primary tab structure to `退休 / 磕袁 / 博史 / 旅行 / 我的`; kept `搞笑` as a non-tab page.
- Generated a cohesive neon-line PNG icon set for all primary tabs.
- Added a retirement progress dashboard using shared `@mono/const` retirement dates.
- Added `normalizeMediaUrl` helpers and applied them to photo display, preview, download, avatar, review, and upload-history image surfaces.
- Verified the reported legacy image URL: `zhangyiming.online` is no longer resolvable; the exact file is also absent on the new `yuanbo.online` server storage.
- Captured a WeChat DevTools screenshot at `.agents/artifacts/miniapp-retire-redesign.png`.

## Iteration Log

- Initial implementation added the retirement tab/page and updated tab assets/config.
- DevTools showed the new page and nav, then reported a `scroll-view` padding warning; the retirement page was split into a scroll container and inner content shell.
- Server read-only checks found `/bofans_static/images` works on `yuanbo.online`, but the cited photo file is not present under `/usr/soso/local-oss-rs/storage`.

## Deferred Verification

- Missing migrated photo files require storage/data migration follow-up; this code pass only normalizes legacy URLs and improves runtime behavior.

## Decisions and Assumptions

- Make `博退休` the first tab and keep `搞笑` as a non-tab page for now to stay within the five-tab miniapp limit.
- Use shared retirement date constants from `@mono/const`.
- Do not hard-code the production API base in source; local preview can still be started with `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans`.

## Files Touched

- `.agents/tasks/archive/2026-06-18-miniapp-retire-redesign.md`
- `.agents/artifacts/miniapp-retire-redesign.png`
- `apps/miniapp-taro/src/app.config.ts`
- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/images/tab-bar/*.png`
- `apps/miniapp-taro/src/lib/media-url.ts`
- `apps/miniapp-taro/src/pages/retire/index.config.ts`
- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `apps/miniapp-taro/src/features/photos/photo-list.ts`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.tsx`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed.
- `pnpm agent:lint` passed.
- Taro watch compiled the changed retirement page successfully.
- WeChat DevTools preview showed the new retirement home page and new primary tab icons.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-redesign.md`
