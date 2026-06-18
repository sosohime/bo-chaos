# Task Record: miniapp upload copy polish

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue miniapp UI polish by tightening upload-page copy toward a Tencent Cloud-style resource submission surface.

## Acceptance Boundaries

- Functional: Replace emotional/repeated upload copy while preserving upload selection, category creation, queue submission, review history, runtime config merge behavior, and API response shape.
- Verification: Run miniapp build, backend build, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers concrete product wording or update docs if a durable new rule is introduced.
- Safety: Do not change upload APIs, env names, runtime config semantics, UGC behavior, production API target, routes, auth, or upload limits.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, backend, project design memory, and doc-sync skills.
- Inspected upload page title/form copy and runtime defaults.
- Identified `珍贵资料上传` and `任务配置 / 上传任务配置` as less product-like wording.
- Replaced the miniapp and backend default upload title with `资料上传`.
- Replaced upload form labels with `提交设置` and `上传配置`.
- Preserved upload selection, category creation, queue submission, review history, runtime config merge behavior, and API response shape.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: submit photo resources into the review queue.
- Primary state: selected images, selected board/category, and submit state.
- Source of truth: runtime miniapp config, selected image queue, category state, and upload API behavior remain unchanged.
- Removal target: emotional or repeated copy that makes the upload surface feel less like an operational product UI.
- Closest Tencent Cloud pattern: resource submission form with concise configuration labels.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-upload-copy-polish.md`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/lib/runtime-config.ts`
- `apps/backend-nest/src/bofans/global/global.controller.ts`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data warning.
- `pnpm -C apps/backend-nest build` passed.
- `git diff --check` passed.
- Anti-slop scan confirmed the old upload copy was removed; remaining hits were unrelated backend `@MaxLength(48)` validation and tabbar fixed positioning.
- `pnpm agent:lint` passed with expected backend/miniapp doc-sync warnings; no architecture or convention docs changed because this was default/display copy only.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-upload-copy-polish.md`
