# Task Record: Miniapp photo item console actions

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud console product surface with credible technical restraint.

## Acceptance Boundaries

- Functional: Shared photo cards keep true `Image lazyLoad`, preview, retry, save-to-album, and review-mode vote behavior. Visual changes must not alter API calls, UGC behavior, or photo data shape.
- Verification: Run production-base mini app build, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Agent docs updated only if conventions change; otherwise record why docs are unaffected.
- Safety: No production writes, no API target changes, no secrets, no backend/data behavior changes.
- Archive: Move this record to `.agents/tasks/archive/` after checks pass.

## Actions

- Read mini app, visual design, doc sync, routing, conventions, quality, and workflow guidance.
- Inspected shared `PhotoItem` TSX/SCSS and its use by grouped and waterfall photo feeds.
- Design diagnosis: this component is the repeated resource item in image feeds. The primary job is to show the media, its category, and two clear row actions. The cheap/inconsistent elements are older blue borders in loading/retry states, a small button-like save control, and a vote count that reads as loose text rather than a state chip. The closest Tencent Cloud pattern is a compact resource row with inline operations and status chips.
- Updated media loading/retry surfaces to use the lighter console blue border and background tokens.
- Tightened save/vote operations into consistent compact action chips without changing event handlers.
- Converted the vote count into a bounded status chip so review-mode cards keep stable action rhythm.

## Iteration Log

- Not using visual-fast-lane; this turn includes shared source changes plus final build/lint.

## Deferred Verification

- WeChat DevTools and real-device visual screenshots remain required for final broad UI acceptance but are not available in this local CLI pass.

## Decisions and Assumptions

- Keep this pass to SCSS so save/vote behavior remains untouched.
- Prefer restrained inline operation chips over decorative image slices; the repeated card primitive still needed native cleanup first.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-photo-item-console-actions.md`
- `apps/miniapp-taro/src/components/photoItem/index.scss`

## Verification Evidence

- `git diff --check`: passed.
- Anti-slop scan for fake intelligence copy, marketing words, glow/gradient/shadow, hard-coded retirement numbers, old animation prompt copy, and loaded-count labels: passed with no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist data age warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this is source-only component polish within existing mini app visual rules.
- WeChat DevTools / real-device screenshots: not run in this local CLI pass; still needed for final broad UI acceptance.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-item-console-actions.md`
