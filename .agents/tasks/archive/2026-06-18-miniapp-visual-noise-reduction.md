# Task Record: miniapp visual noise reduction

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving the mini app's UI taste toward a Tencent Cloud product-console feel with restrained AI/technology styling.

## Acceptance Boundaries

- Functional: reduce cheap-looking visual noise caused by heavy shadows, overuse of blue gradients, oversized font weight, and casual footer copy.
- Verification: mini app build and agent lint.
- Docs Sync: no API, data model, architecture, or convention changes; visual polish and UI copy only.
- Safety: no production writes, no secrets, no endpoint changes.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Reduced oversized card shadows across shared mini app cards, retirement, gallery, approval, profile, swiper, and birthday surfaces.
- Replaced several blue gradient primary controls/progress fills with solid product blue for a more console-like visual language.
- Lowered overly heavy `900` font weights in key headers and tab markers.
- Replaced casual list footer copy such as `到底啦` with a more product-like `已加载全部`.

## Decisions and Assumptions

- This pass intentionally removes visual noise instead of adding more illustration, because previous generated/marketing-style imagery was rejected.
- The palette remains aligned with Tencent Cloud-like blue/white UI, but with less glow and fewer gradients.

## Files Touched

- `apps/miniapp-taro/src/app.scss`
- `apps/miniapp-taro/src/components/boSheng/index.scss`
- `apps/miniapp-taro/src/components/swiperImg/index.scss`
- `apps/miniapp-taro/src/features/photos/CategoryPhotoSections.tsx`
- `apps/miniapp-taro/src/features/photos/WaterfallPhotoGrid.tsx`
- `apps/miniapp-taro/src/features/photos/photo-browser.scss`
- `apps/miniapp-taro/src/pages/approve/components/tabHead/index.scss`
- `apps/miniapp-taro/src/pages/approve/index.scss`
- `apps/miniapp-taro/src/pages/approve/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-visual-noise-reduction.md`

## Verification Evidence

- `rg` scan for old casual footer copy, removed CTA gradients, large shadows, and `font-weight: 900`: no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; conventions docs were not changed because this pass is visual polish and copy refinement only.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-visual-noise-reduction.md`
