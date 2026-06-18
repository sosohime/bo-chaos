# Task Record: miniapp tabbar bottom rule

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward Tencent Cloud product-console quality by improving the global tab bar active/inactive treatment.

## Acceptance Boundaries

- Functional: Custom tab bar should keep route behavior and runtime tab visibility while making active/inactive states stable, restrained, and less template-like.
- Verification: Run mini app WeApp build with production API base, `git diff --check`, anti-slop scan on touched files, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if no L2 doc changes are needed.
- Safety: Do not change tab routing, runtime UGC visibility, tab labels, image paths, or production API target.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Design Diagnosis

- Screen job: Provide global navigation with reliable current-location feedback.
- Primary state: active tab should be immediately legible without resizing or looking like a floating marketing pill.
- Cheap/noisy element: the active icon shell plus top indicator makes the tab feel like a decorative button instead of a navigation item.
- Source of truth: current route and runtime-config tab visibility/text only.
- Tencent Cloud reference pattern: compact navigation rail/footer with subtle active rule, quiet inactive labels, and stable icon rhythm.
- Tech allowance: precise line and color treatment only; no fake system claims or decorative image slice.

## Actions

- Read mini app and visual design skills plus relevant agent docs.
- Inspected custom tab bar TSX/SCSS and tab icon assets.
- Created a local contact sheet for icon inspection at `/tmp/bo-chaos-tab-icons.png`.
- Removed the active icon shell treatment from the custom tab bar.
- Moved the selected-state rule to a short bottom indicator, tightened tab bar height, and made inactive labels quieter.

## Decisions and Assumptions

- Existing tab icon assets are serviceable enough for this pass; the stronger fix is removing the decorative icon shell and making selection state calmer.

## Files Touched

- `apps/miniapp-taro/src/custom-tab-bar/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-tabbar-bottom-rule.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed. Taro compiled successfully; Browserslist data warning is pre-existing/toolchain-related.
- `git diff --check` passed.
- Anti-slop scan on touched files passed with zero matches.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; L2 docs are unaffected because this is source-only visual polish and does not change conventions.
- WeChat DevTools or real-device visual inspection was not run in this turn, so broad final UI acceptance remains unverified.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-bottom-rule.md`
