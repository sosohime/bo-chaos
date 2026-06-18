# Task Record: miniapp upload command rail

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving the mini app toward a Tencent Cloud-style product console with restrained tech feeling.

## Acceptance Boundaries

- Functional: Refine the upload summary action into a clearer primary command rail while preserving existing add/submit behavior, queue state, and UGC gating.
- Verification: Run the miniapp WeChat build, focused anti-slop scan, `git diff --check`, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if agent docs are unaffected.
- Safety: Do not touch production, API base URLs, secrets, schema, auth, backend behavior, or upload security behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record.
- Refined the upload summary command row into a clearer primary task rail with a main-task label, command title, truthful queue/configuration meta, and stronger ready state.
- Preserved existing `handleUploadNextCommand`, add image, submit, upload queue, and UGC gating behavior.

## Iteration Log

- User direction remains Tencent Cloud console fit plus credible AI/tech feeling without fake dashboards or decorative effects.

## Deferred Verification

- WeChat DevTools / real-device visual verification remains required for final visual acceptance if available.

## Decisions and Assumptions

- Screen job: configure a photo upload, add local images, and submit the queue for review.
- Primary state/action: the current upload stage and the next concrete command.
- Data source: selected system/category/images, upload summary, and local constants.
- Removal target: weak next-step row that does not read as the primary operation in a product console.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-upload-command-rail.md`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist stale-data and Node punycode deprecation warnings.
- Focused anti-slop scan: passed; only unrelated backend `apps/backend-nest/src/bofans/users/users.controller.ts:36 @MaxLength(48)` matched.
- `git diff --check`: passed.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because miniapp source changed without `docs/agent/CONVENTIONS.md`; no conventions update needed for this local component visual/interaction polish.
- WeChat DevTools / real-device visual verification: not run in this turn.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-upload-command-rail.md`
