# Task Record: miniapp upload stepper console

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue the Tencent Cloud console mini app refactor by making the upload flow stepper less form-wizard-like and more product-console credible.

## Acceptance Boundaries

- Functional: Upload flow keeps the same four step states, labels, selected/upload queue behavior, and submit logic while the stepper visual treatment becomes flatter, stable, and aligned with the console resource panels.
- Verification: Run the mini app WeChat build with production API base URL, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if conventions change; otherwise record why source-only visual polish does not need docs.
- Safety: No API target, auth, runtime config, UGC switch, queue limit, upload concurrency, or upload logic changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, and doc-sync skills.
- Read routing, conventions, quality, and workflow docs.
- Inspected account upload section TSX/SCSS.
- Diagnosis: upload state summary and form panels already use console primitives, but the four-step flow uses boxed markers and a traditional wizard line that feels less like a compact Tencent Cloud resource surface.
- Updated the upload stepper to use a flat segmented process strip with compact row labels, restrained dividers, and an active top rule instead of boxed wizard nodes.

## Iteration Log

- User feedback context: app should feel closer to Tencent Cloud product UI with restrained tech polish, not generic form UI.

## Deferred Verification

- WeChat DevTools/device screenshot verification remains required for final broad UI acceptance but is not available in this shell pass.

## Decisions and Assumptions

- Preserve TSX and all behavior; this pass changes only the upload stepper's visual hierarchy.
- Favor a flat segmented process strip with a top-state rule over boxed wizard nodes.

## Files Touched

- `apps/miniapp-taro/src/pages/my/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-upload-stepper-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully. Existing Browserslist staleness warning remains.
- `git diff --check`: passed.
- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|box-shadow|gradient|glow|hero|营销|山寨|点击查看动图|15年|48|✕|↓" apps/miniapp-taro/src/pages/my/index.scss -g '*.{tsx,scss,ts}'`: benign matches for avatar `48px` width/height only; no fake AI/marketing/retirement-rule copy.
- `pnpm agent:lint`: passed with warning `miniapp-doc-sync` because mini app source changed without `docs/agent/CONVENTIONS.md`; docs are unaffected because this is source-only visual polish and does not change conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-upload-stepper-console.md`
