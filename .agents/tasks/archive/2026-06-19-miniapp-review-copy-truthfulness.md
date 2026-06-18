# Task Record: miniapp review copy truthfulness

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue miniapp UI truthfulness by removing fake compression-tool copy from review-mode runtime surfaces.

## Acceptance Boundaries

- Functional: Replace review-mode compression-tool copy with honest runtime configuration/status copy while preserving inReview switching, runtime config merge behavior, upload/photo navigation semantics, and API response shape.
- Verification: Run miniapp build, backend build or focused TypeScript check if feasible, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers data honesty/action wording or update docs if a durable new rule is introduced.
- Safety: Do not change environment variable names, publish-status semantics, routes, auth, UGC behavior, production API target, or response DTO shape.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, backend, project design memory, and doc-sync skills.
- Found review-mode kowtow copy claiming a picture compression tool and backend/default runtime title with the same claim.
- Identified the copy as misleading product chrome inconsistent with the current design memory.
- Replaced the miniapp review-mode panel copy with honest `资料区状态` / `BoFans 资料区` wording.
- Replaced fake compression-processing rows with upload, review, and category-page status rows.
- Updated miniapp and backend default `reviewKowtowTitle` to `BoFans资料区状态` so runtime defaults stay aligned.
- Preserved `inReview` switching, runtime config merge behavior, upload/photo navigation semantics, and API response shape.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: show the current BoFans资料区 availability in review mode without pretending to be another product.
- Primary state: content entry and upload/review flow availability.
- Source of truth: runtime `inReview` flag and runtime miniapp config merge remain unchanged.
- Removal target: `图片压缩工具`, `图片处理服务`, and `审核后压缩` copy.
- Closest Tencent Cloud pattern: service/status summary with honest resource rows.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-review-copy-truthfulness.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/lib/runtime-config.ts`
- `apps/backend-nest/src/bofans/global/global.controller.ts`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `pnpm -C apps/backend-nest build` passed.
- `git diff --check` passed.
- Anti-slop scan confirmed fake compression-tool copy was removed; remaining hits were unrelated backend length validation, tabbar fixed positioning, and a normal upload-history category-page hint.
- `pnpm agent:lint` passed with backend-doc-sync and miniapp-doc-sync warnings; no docs update needed because the change only adjusts default runtime copy and display text without changing architecture, contracts, or conventions.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-review-copy-truthfulness.md`
