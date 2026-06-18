# Task Record: Miniapp token cleanup

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud console product surface with credible technical restraint.

## Acceptance Boundaries

- Functional: Existing account, upload, history, kowtow, retire, and approval behavior remains unchanged. Visual cleanup removes stale border tokens and avoids lazy-loaded image count copy that looks like a total.
- Verification: Run production-base mini app build, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Agent docs updated only if conventions change; otherwise record why docs are unaffected.
- Safety: No production writes, no API target changes, no secrets, no backend/data behavior changes.
- Archive: Move this record to `.agents/tasks/archive/` after checks pass.

## Actions

- Read mini app, visual design, doc sync, routing, conventions, quality, and workflow guidance.
- Scanned remaining mini app pages and shared components for stale blue border tokens, avatar sizing that triggered the retirement-number scan, and loaded-count copy.
- Design diagnosis: these are small but repeated credibility leaks. The important state is operational clarity, while stale token edges and loaded-count labels make screens feel stitched together. The closest Tencent Cloud pattern is consistent status chip styling and precise state labels.
- Renamed the approval loaded item summary label from `本次图片` to `可见项`.
- Updated account avatar, upload state chip, upload history empty glyph, kowtow index chip, and retire timezone chip to the current console token set.
- Removed the remaining old blue border tokens from the touched mini app surfaces.

## Iteration Log

- Not using visual-fast-lane; this turn includes source changes plus final build/lint.

## Deferred Verification

- WeChat DevTools and real-device visual screenshots remain required for final broad UI acceptance but are not available in this local CLI pass.

## Decisions and Assumptions

- Keep this pass visual/copy-only; no data, upload, vote, retirement, or review logic changes.
- Preserve current loaded item value in approval summary but label it as a visible view state, not a total.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-token-cleanup.md`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/pages/retire/index.scss`

## Verification Evidence

- `git diff --check`: passed.
- Touched-file anti-slop scan for fake intelligence copy, marketing words, glow/gradient/shadow, hard-coded retirement numbers, old animation prompt copy, loaded-count labels, and old border tokens: passed with no matches.
- Global mini app scan for old blue tokens, loaded-count labels, and hard-coded retirement copy: passed with no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist data age warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this is source-only visual cleanup within existing mini app rules.
- WeChat DevTools / real-device screenshots: not run in this local CLI pass; still needed for final broad UI acceptance.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-token-cleanup.md`
