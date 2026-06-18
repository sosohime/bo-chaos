# Task Record: miniapp upload queue console

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue the Tencent Cloud console mini app refactor by reducing visual noise in the upload image queue.

## Acceptance Boundaries

- Functional: Upload queue keeps lazy-loaded previews, remove action, upload status chip, and progress rail while the thumbnail matrix becomes quieter and more resource-console-like.
- Verification: Run the mini app WeChat build with production API base URL, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if conventions change; otherwise record why source-only visual polish does not need docs.
- Safety: No API target, auth, runtime config, UGC switch, upload queue limit, progress logic, or remove behavior changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, and doc-sync skills.
- Read routing, conventions, quality, and workflow docs.
- Inspected account upload queue TSX/SCSS.
- Diagnosis: queue behavior is correct and previews use `Image lazyLoad`, but status chips, remove controls, and progress rails read as heavy overlays instead of compact resource state markers.
- Tightened queue thumbnail chrome, made status/remove overlays smaller, and reduced progress rail weight while avoiding overlap between status chip and upload progress.

## Iteration Log

- User feedback context: app should feel closer to Tencent Cloud product UI with restrained tech polish, not generic form UI.

## Deferred Verification

- WeChat DevTools/device screenshot verification remains required for final broad UI acceptance but is not available in this shell pass.

## Decisions and Assumptions

- Preserve TSX and all upload behavior; this pass changes only upload queue visual hierarchy.
- Treat selected images as resource thumbnails with state markers rather than decorative cards.

## Files Touched

- `apps/miniapp-taro/src/pages/my/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-upload-queue-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully. Existing Browserslist staleness warning remains.
- `git diff --check`: passed.
- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|box-shadow|gradient|glow|hero|营销|山寨|点击查看动图|15年|48|✕|↓" apps/miniapp-taro/src/pages/my/index.scss -g '*.{tsx,scss,ts}'`: benign matches for avatar `48px` width/height only; no fake AI/marketing/retirement-rule copy.
- `pnpm agent:lint`: passed with warning `miniapp-doc-sync` because mini app source changed without `docs/agent/CONVENTIONS.md`; docs are unaffected because this is source-only visual polish and does not change conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-upload-queue-console.md`
