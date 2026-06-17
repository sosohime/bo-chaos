# Task Record: miniapp tabbar taste pass

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Improve the mini app UI taste after the tab bar and active/inactive states were called out as still looking cheap.

## Acceptance Boundaries

- Functional: bottom tab active state must not depend on filtered list index; visible tab UI must move away from placeholder letter glyphs and mismatched legacy PNG assets.
- Verification: mini app build and agent lint.
- Docs Sync: no API, data model, architecture, or convention changes; UI and local tab state only.
- Safety: no production writes, no secrets, no endpoint changes.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Replaced bottom tab letter glyph blocks with CSS-drawn lightweight line icons for retire, kowtow, history, travel, and profile.
- Changed bottom tab active state from filtered index matching to stable tab keys and current route detection, fixing incorrect active/inactive states when tabs are hidden or navigation is programmatic.
- Synced the retirement page's `switchTab` shortcut to the new stable `kowtow` tab key.
- Removed legacy PNG display from approval tabs and photo card action buttons, replacing them with restrained product-style controls.
- Added an approval queue console header based on current tab, loading state, and available totals.

## Decisions and Assumptions

- Taste-skill style guidance was applied as a design constraint: avoid placeholder glyphs, generic AI decoration, and asset collage; favor clear hierarchy, real state, and restrained product controls.
- The native `app.config.ts` tab icon paths remain for WeChat config compatibility, but custom tab UI no longer renders those PNG assets.

## Files Touched

- `apps/miniapp-taro/src/app.tsx`
- `apps/miniapp-taro/src/lib/context.ts`
- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`
- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/approve/index.scss`
- `apps/miniapp-taro/src/pages/approve/components/tabHead/index.tsx`
- `apps/miniapp-taro/src/pages/approve/components/tabHead/index.scss`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/components/photoItem/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-tabbar-taste-pass.md`

## Verification Evidence

- `rg` scan for placeholder Latin tab glyphs, old rendered approval/photo action image imports, index-based tab active state, and old neon tokens: no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; conventions docs were not changed because this pass adjusts UI taste and local tab state, not mini app architecture or coding conventions.

## Handoff / Archive Notes

- Final state: complete after agent lint evidence is added.
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-taste-pass.md`
