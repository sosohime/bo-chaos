# Task Record: restore Bo photos from Supersosoplus

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Restore historical Bo photos previously hosted on `zhangyiming.online` from the Supersosoplus Synology photo share.

## Acceptance Boundaries

- Functional: Restore missing historical `zhangyiming.online` photo/avatar files to `yuanbo.online` storage and update DB URLs only if all files are found.
- Verification: Confirm source match count, package contents, server extraction, public URL access, service health, and DB counts.
- Docs Sync: Run `pnpm agent:lint` before final response.
- Safety: Stop before DB rewrite if any expected file is missing.
- Archive: Move this record to `.agents/tasks/archive/` when complete, blocked, or handed off.

## Actions

- Created task record.
- Mounted `smb://Supersosoplus._smb._tcp.local/photo` at `/private/tmp/supersosoplus-photo`.
- Confirmed additional Supersosoplus shares mounted locally: `backup`, `home`, `homes`, and `downloads`.
- Exported production DB references containing `zhangyiming.online` to `/tmp/bo-zhangyiming-refs.json`.
- Searched mounted shares by the 123 expected standardized basenames.
- Checked Synology Photos date folders under `Photos/CFA`, including March 2025 directories.
- Inspected image dimensions for likely March 2025 source folders.
- Found some March 2025 raw/mobile backup candidates by filesystem date under `MobileBackup/XQ-EC72/DCIM/Camera/2025/03` and `WeChatBackup/XQ-EC72/Pictures`, but not enough to map the 123 processed DB filenames automatically.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- Use SMB share `smb://Supersosoplus._smb._tcp.local/photo`.
- Use local package upload as the transfer path.
- Do not create a restore package or rewrite production DB URLs unless all expected files are matched with high confidence.
- Standardized zhangyiming file names are not present in the mounted Synology shares.

## Files Touched

- `.agents/tasks/active/20260530-194444-supersosoplus-photo-restore.md`

## Verification Evidence

- SMB shares visible from `smbutil view`: `photo`, `backup`, `home`, `homes`, `downloads`, and others.
- Production missing URL export: 122 `Photo.filename` references and 1 `User.avatarUrl` reference, total 123.
- Exact basename search across mounted Synology shares: 0 found, 123 missing.
- `/Volumes/home/Photos/CFA/2025-03-*` exists and contains original camera-style files, for example `2025-03-16` has 433 images.
- Likely March 2025 source images inspected by `sips` are `8640x5760`, while DB target filenames encode processed dimensions such as `4096x3072`, `854x640`, and `1706x1279`.
- Filesystem date search found raw candidates around 2025-03-09 to 2025-03-11 in mobile/WeChat backup folders, but no one-to-one filename match to DB records.
- No restore archive was produced and no production DB rewrite was performed.

## Handoff / Archive Notes

- Final state: blocked
- Archive path: `.agents/tasks/archive/20260530-194444-supersosoplus-photo-restore.md`
