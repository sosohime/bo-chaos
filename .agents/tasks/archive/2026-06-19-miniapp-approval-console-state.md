# Task Record: Miniapp approval console state

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Keep moving the mini app UI toward a Tencent Cloud console feel with more credible technical restraint.

## Acceptance Boundaries

- Functional: Approval history keeps the same queue behavior, UGC kill switch, backend totals, pagination, preview, and true `Image lazyLoad`; visible lazy-loaded item count must not read like a tab/category total.
- Verification: Run production-base mini app build, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Agent docs updated only if conventions change; otherwise record why docs are unaffected.
- Safety: No production writes, no API target changes, no secrets, no behavior change to moderation data.
- Archive: Move this record to `.agents/tasks/archive/` after checks pass.

## Actions

- Read mini app, visual design, doc sync, routing, conventions, quality, and workflow guidance.
- Inspected approval page TSX and SCSS plus the local tab head component.
- Design diagnosis: this screen is a review/upload queue surface. The primary above-fold state is the selected queue and server-provided total. The cheap/inconsistent elements are top-border selected tabs, older blue chip borders, and a loaded-item summary label that could be mistaken for a real queue total. The closest Tencent Cloud pattern is a compact resource list with tabbed queue states. The allowed tech feel is precise queue/status labeling, not decorative diagnostics or fake metrics.
- Replaced the approval tab selected state with a stable bottom rule and quieter inactive dot/chip styling.
- Renamed the visible loaded count label from `已加载` to `本次图片`.
- Added a dedicated list header state chip and aligned approval status/glyph borders to the lighter console blue.

## Iteration Log

- Not using visual-fast-lane; this turn includes source changes plus final build/lint.

## Deferred Verification

- WeChat DevTools and real-device visual screenshots remain required for final broad UI acceptance but are not available in this local CLI pass.

## Decisions and Assumptions

- Keep this pass narrow to approval queue chrome rather than adding image slices; the native hierarchy is the current blocker.
- Use backend `total` for queue/tab totals and label the visible loaded item count as a local page state only.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-approval-console-state.md`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.scss`
- `apps/miniapp-taro/src/pages/approve/components/tabHead/index.scss`

## Verification Evidence

- `git diff --check`: passed.
- Anti-slop scan for fake intelligence copy, marketing words, glow/gradient/shadow, hard-coded retirement numbers, old animation prompt copy, and `已加载`: passed with no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist data age warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this is a source-only visual polish within existing mini app rules.
- WeChat DevTools / real-device screenshots: not run in this local CLI pass; still needed for final broad UI acceptance.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-approval-console-state.md`
