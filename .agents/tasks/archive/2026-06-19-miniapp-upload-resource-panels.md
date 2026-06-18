# Task Record: miniapp upload resource panels

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by refining upload, history, and UGC disabled resource states.

## Acceptance Boundaries

- Functional: Remove decorative left rails from upload/history/UGC resource panels while preserving upload selection, real upload progress, submit behavior, history loading, and UGC kill switch behavior.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers these resource-panel rules or update docs if a durable new rule is introduced.
- Safety: Do not change upload APIs, runtime config, auth, production API target, routes, photo lazy loading, or data-count behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected the account/upload page and shared UGC disabled state.
- Identified remaining decorative left rails in upload, history, and UGC disabled surfaces.
- Confirmed upload progress is driven by `uploadStatus[index].process` and should remain as a real progress indicator.
- Removed upload and history section left rails while keeping their panel structure.
- Removed the upload form left rail and kept field/action behavior unchanged.
- Reduced the upload progress bar to a quieter true progress line.
- Removed history empty/error state left rails and tightened glyph, spacing, and divider placement.
- Removed the shared UGC disabled left rail and aligned it with compact resource state panels.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: the account page should manage user upload work and history like a compact resource console.
- Primary state: upload queue, submit availability, real progress, and history empty/error state.
- Source of truth: selected image count, `MAX_SELECTED_IMAGES`, runtime UGC config, and upload/history hook state remain unchanged.
- Removal target: decorative resource rails that make the page feel template-like instead of operational.
- Closest Tencent Cloud pattern: resource panel, upload queue, and empty resource state.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-upload-resource-panels.md`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/features/photos/ugc-disabled-state.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `git diff --check` passed.
- Anti-slop scan on touched miniapp files found no banned marketing/AI/fake-count/old-retirement/rail terms.
- `pnpm agent:lint` passed with `miniapp-doc-sync` warning; no docs update needed because `apps/miniapp-taro/DESIGN.md` already covers compact resource panels, UGC disabled states, and real progress indicators.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-upload-resource-panels.md`
