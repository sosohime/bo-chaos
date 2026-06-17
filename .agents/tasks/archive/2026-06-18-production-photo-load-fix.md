# Task Record: production photo load fix

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: main
- Request: Fix mini app photo load failures after moving static hosting to yuanbo.online.

## Acceptance Boundaries

- Functional: Public mini app photo lists must stop serving broken zhangyiming.online photo URLs and must load existing yuanbo.online static photo assets.
- Verification: Verify production API payloads, static image HTTP responses, and WeChat DevTools mini app preview.
- Docs Sync: Record production backup points and verification evidence.
- Safety: Do not print secrets; create production backups before DB/nginx changes.
- Archive: Archive this task record after verification.

## Actions

- Confirmed public photo API still returned old zhangyiming.online URLs whose files were absent from the migrated storage.
- Confirmed yuanbo.online `/bofans_static` returned the retire app fallback for missing static paths, causing redirect-heavy image failures.
- Backed up affected production photo row snapshots under `/usr/soso/backups/bofans-photo-status-fix-2026-06-17T18-13-17-744Z`.
- Updated production photo statuses so missing old passed rows are no longer public and file-backed Synology import rows are public.
- Backed up nginx config to `/etc/nginx/conf.d/yuanbo-online-migrated.conf.bak.static404.20260618021403`.
- Changed production `/bofans_static` nginx fallback to return `404` for missing static files instead of the retire app fallback, then reloaded nginx after `nginx -t`.
- Refreshed WeChat DevTools; the history page now renders the `群晖导入` group from `yuanbo.online/bofans_static/photo/synology-bo/...`.

## Iteration Log

- User reported mini app photos still failed after the UI and static host refactor.
- Production API and static file checks isolated the problem to stale public DB rows plus nginx fallback behavior.
- After production repair, DevTools initially showed stale page state; a simulator refresh reloaded the new API response and images.

## Deferred Verification

- None.

## Decisions and Assumptions

- Treat old public photo rows whose files are absent on the migrated server as non-public instead of continuing to expose broken cards.
- Promote only Synology import rows with files present on disk.
- Leave travel and tease empty for now because their old public source files are not present on the migrated server.

## Files Touched

- `.agents/tasks/archive/2026-06-18-production-photo-load-fix.md`

## Verification Evidence

- `curl https://yuanbo.online/rpg/bofans/photos?system=history&page=1&pageSize=12`: returned passed `群晖导入` rows with yuanbo.online `synology-bo` filenames.
- `curl -I` equivalent checks for the first 24 history image URLs: all returned `200` with `image/jpeg` or `image/gif`.
- Old missing example `https://yuanbo.online/bofans_static/photo/photo_o-IL461w71U1_ENzbM3I1fAIe6O0_1758034422443_640x854.jpg`: returned `404` with no redirect.
- WeChat DevTools preview: `pages/history/index` rendered `群晖导入 (24)` and visible images after refresh.
- Public list counts after fix: history `488`, travel `0`, tease `0`.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-production-photo-load-fix.md`
