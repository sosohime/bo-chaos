# Task Record: Bo Clean Import Package

- State: active
- Mode: full
- Started: 2026-05-31
- Branch: main
- Request: Build a clean import package and manifest from confirmed Bo Synology person photos plus confirmed adjacent positives.

## Acceptance Boundaries

- Functional: Produce a local deployable image package, manifest, and SQL import plan from only confirmed Bo sources.
- Verification: Check package file counts, manifest row counts, SQL URL counts, package checksum, and sampled rendered output.
- Docs Sync: No repo behavior changes expected; run agent harness before finishing.
- Safety: Do not upload to the production server or write the production database in this step.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Built `/tmp/bo-clean-import` from the 478 confirmed Synology Photos `博` items plus 10 user-confirmed `/p/gu6s图片` positives.
- Converted 193 RAW `.ARW` files to web JPEGs and normalized orientation with ImageMagick `-auto-orient`.
- Converted non-GIF still images to max-edge 2560 JPEGs and preserved 5 GIFs.
- Generated `/tmp/bo-clean-import/manifest.tsv`, `/tmp/bo-clean-import/import.sql`, `/tmp/bo-clean-import/copy-to-server.sh`, and `/tmp/bo-clean-import/summary.json`.
- Packed `/tmp/bo-clean-import.tgz`.

## Iteration Log

- First package pass used `sips`; sampled contact sheet revealed EXIF orientation risk for RAW conversions.
- Rebuilt the package with ImageMagick `-auto-orient -resize 2560x2560> -strip -quality 88`.

## Deferred Verification

- Production URL checks, server file hash checks, and DB count checks are deferred until the user approves upload/import.

## Decisions and Assumptions

- Category mapping uses `system=history`, `name=history`, `secondCategory=群晖导入`.
- New `Photo` rows are planned with `status=reviewing`, not published.
- Static destination prefix is `bofans/photo/synology-bo`, exposed as `https://yuanbo.online/bofans_static/photo/synology-bo/...`.
- The package is local-only until a separate production write step is approved.

## Files Touched

- `.agents/tasks/active/20260531-000000-bo-clean-import-package.md`
- `/tmp/bo-clean-import/`
- `/tmp/bo-clean-import.tgz`

## Verification Evidence

- Package contents: 488 files under `bofans/photo/synology-bo`.
- Manifest: 489 lines including header, 488 data rows.
- SQL plan: 488 `yuanbo.online/bofans_static/photo/synology-bo` URL values.
- Package checksum: `9097002c07d0dd161cb1127e1a4081af9375c77584a11d638fa8230957ff5a53`.
- Sample contact sheet: `/tmp/bo-clean-import/sample-contact-sheet.jpg` rendered with corrected orientation.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/20260531-000000-bo-clean-import-package.md`
