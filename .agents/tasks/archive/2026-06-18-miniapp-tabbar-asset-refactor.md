# Task Record: miniapp tabbar asset refactor

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud style product UI with less cheap-looking tab navigation.

## Acceptance Boundaries

- Functional: Preserve runtime tab visibility/text, tab switching, UGC tab hiding, and existing page paths.
- Verification: Build the WeChat mini app, run agent lint, and check whitespace diffs.
- Docs Sync: No architecture or command docs expected; record if source-only visual polish does not require docs changes.
- Safety: No production writes, no API target changes, no secrets.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Diagnosed the custom tab bar as still using hand-built CoverView glyphs while the app already carries tab image assets.
- Existing PNG assets had heavy outer rings and bright cyan active colors, which did not fit the Tencent Cloud console direction.
- Replaced CSS-composed glyph markup with `CoverImage` references to stable tab icon assets.
- Regenerated the five inactive/active tab PNG pairs as transparent 96x96 line icons in gray-blue and Tencent-style blue.
- Simplified the tab bar chrome by removing the heavy shadow, icon border shell, and hand-built glyph CSS.
- Confirmed the built mini app custom tab bundle references `/images/tab-bar/*.png` and copies the generated assets to `dist/images/tab-bar`.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final visual acceptance if the tool window is available.

## Decisions and Assumptions

- Use transparent line icon PNG assets with stable dimensions instead of CSS-composed glyphs.
- Keep active/inactive state differences to color, a small top rule, and a very light selected background; no size jump or floating pill.

## Files Touched

- apps/miniapp-taro/src/custom-tab-bar/index.tsx
- apps/miniapp-taro/src/custom-tab-bar/index.scss
- apps/miniapp-taro/src/images/tab-bar/\*.png

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist stale-data and Node punycode warnings.
- `find apps/miniapp-taro/dist/images/tab-bar -type f`: confirmed all five inactive/active tab PNG pairs are packaged.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no docs update needed because this was source-only presentation polish.
- `git diff --check`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-asset-refactor.md`
