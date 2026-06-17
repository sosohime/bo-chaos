# Task Record: miniapp tabbar capsule polish

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving mini app UI taste, with the bottom tab active/inactive states still considered not good enough.

## Acceptance Boundaries

- Functional: improve the bottom tab's active/inactive state relationship without changing app routes, API behavior, or runtime config.
- Verification: mini app build and agent lint.
- Docs Sync: no architecture, data model, API, or convention changes; visual tabbar polish only.
- Safety: no production writes, no secrets, no endpoint changes.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Changed the active bottom tab from a separated icon capsule plus label into one selected capsule that contains both icon and label.
- Kept inactive tabs lightweight and vertical, making active versus inactive states clearer without heavy glow or placeholder letter glyphs.
- Preserved the existing CSS-drawn icon approach and stable key-based active state from the previous pass.

## Decisions and Assumptions

- This pass intentionally stayed small because the user specifically called out bottom tab active/inactive styling.
- No generated image assets were introduced; the bottom nav remains CSS-rendered for consistency and low maintenance.

## Files Touched

- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-tabbar-capsule-polish.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; conventions docs were not changed because this pass is visual tabbar polish only.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-capsule-polish.md`
