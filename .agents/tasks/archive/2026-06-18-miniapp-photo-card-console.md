# Task Record: miniapp photo card console

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue the Tencent Cloud console mini app refactor by making shared photo cards less noisy and more resource-console credible.

## Acceptance Boundaries

- Functional: Photo cards keep lazy-loaded images, preview, save, vote/cancel vote, loading/error/retry states, and existing data sources while their visual chrome becomes quieter and more console-like.
- Verification: Run the mini app WeChat build with production API base URL, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if conventions change; otherwise record why source-only visual polish does not need docs.
- Safety: No API target, auth, runtime config, UGC switch, image URL, or vote/save logic changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, and doc-sync skills.
- Read routing, conventions, quality, and workflow docs.
- Inspected shared photo item TSX/SCSS.
- Diagnosis: shared photo card behavior is correct, including true `Image lazyLoad`, but the visual treatment has stacked borders and button-like controls that make dense feeds feel busier than Tencent Cloud-style resource lists.
- Reduced shared photo card visual noise by removing the inner media border, tightening card radius/padding, and converting save/vote controls to quieter row actions.

## Iteration Log

- User feedback context: app should feel closer to Tencent Cloud product UI with restrained tech polish, not decorative or fake AI chrome.

## Deferred Verification

- WeChat DevTools/device screenshot verification remains required for final broad UI acceptance but is not available in this shell pass.

## Decisions and Assumptions

- Preserve TSX and all behavior; this pass is shared card visual polish only.
- Reduce visual noise rather than adding generated image slices because feeds already display real product media.

## Files Touched

- `apps/miniapp-taro/src/components/photoItem/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-photo-card-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully. Existing Browserslist staleness warning remains.
- `git diff --check`: passed.
- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|box-shadow|gradient|glow|hero|营销|山寨|点击查看动图|15年|48|✕|↓" apps/miniapp-taro/src/components/photoItem/index.scss -g '*.{tsx,scss,ts}'`: no matches.
- `pnpm agent:lint`: passed with warning `miniapp-doc-sync` because mini app source changed without `docs/agent/CONVENTIONS.md`; docs are unaffected because this is source-only visual polish and does not change conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-photo-card-console.md`
