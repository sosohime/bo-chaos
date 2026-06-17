# Task Record: miniapp console structure polish

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue aligning the mini app with a Tencent Cloud product-console feel and restrained AI/technology accents, without official-site marketing imagery.

## Acceptance Boundaries

- Functional: strengthen key page structure beyond color changes while preserving existing data/API behavior.
- Verification: mini app build and agent lint.
- Docs Sync: no API, data model, architecture, or convention changes; visual and layout polish only.
- Safety: no production writes, no secrets, no runtime config or endpoint changes.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Added consistent product-console headers to the history, travel, and tease gallery pages with real UGC visibility state.
- Added factual retirement start and target date anchors to the retirement countdown panel, using shared constants.
- Added an upload panel header that reflects the actual selected image count and submit state.
- Reworked upload progress and remove controls away from dark overlays into the blue-white product palette.
- Re-ran source scans to confirm old dark/neon tokens and emoji-style decoration were not present in the mini app source.

## Decisions and Assumptions

- No new generated image assets were introduced because the user rejected the official-site/marketing image direction.
- The retirement page remains limited to canonical dates and countdown/progress facts from shared constants.
- Gallery headers intentionally avoid category totals because lazy-loaded lists do not have backend category totals in the current UI contract.

## Files Touched

- `apps/miniapp-taro/src/pages/history/index.tsx`
- `apps/miniapp-taro/src/pages/travel/index.tsx`
- `apps/miniapp-taro/src/pages/tease/index.tsx`
- `apps/miniapp-taro/src/features/photos/photo-browser.scss`
- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-console-structure-polish.md`

## Verification Evidence

- `rg` scan for old dark/neon tokens, old marketing labels, and emoji decoration in mini app source: no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; conventions docs were not changed because this pass only adjusts visual structure and styling, not mini app architecture or coding conventions.

## Handoff / Archive Notes

- Final state: complete after verification evidence is added.
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-console-structure-polish.md`
