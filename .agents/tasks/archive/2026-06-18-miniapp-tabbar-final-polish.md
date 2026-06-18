# Task Record: miniapp tabbar final polish

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud product-console feel with restrained AI/tech polish.

## Acceptance Boundaries

- Functional: Preserve tab switching, runtime tab labels/visibility, UGC hidden tabs, selected-tab context, and tab icon assets.
- Visual: Make active/inactive tab states stable and console-like without pill/marketing highlight treatment.
- Safety: No production writes, no API target changes, no secrets, no runtime behavior changes.
- Verification: Run source scans, `git diff --check`, WeChat mini app build, and `pnpm agent:lint`.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Design Diagnosis

- Screen job: global navigation should provide stable orientation and quick route switching.
- Primary state: active tab.
- Source of truth: current route, selected tab context, runtime mini app config, and UGC visibility.
- Current weak points: active tab still has a pale block background, which can read like a campaign pill rather than Tencent Cloud-style restrained selection.
- Removal target: active tab background fill while keeping the top indicator, icon, and text state.

## Actions

- Read custom tab bar TSX/SCSS and runtime/app config references.
- Removed the active tab control background so selection relies on the blue top indicator, active icon asset, and active label color.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final broad visual acceptance if the tool window becomes available.

## Decisions and Assumptions

- Keep the edit CSS-only because tab routing and runtime behavior are already correct.

## Files Touched

- apps/miniapp-taro/src/custom-tab-bar/index.scss

## Verification Evidence

- Source scan confirmed the active tab background fill `#f7faff` was removed while stable control dimensions and active indicator remain.
- `pnpm exec prettier --write apps/miniapp-taro/src/custom-tab-bar/index.scss .agents/tasks/active/2026-06-18-miniapp-tabbar-final-polish.md` passed; files were unchanged after formatting.
- `git diff --check` passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro/Webpack compiled successfully.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because mini app source changed without `docs/agent/CONVENTIONS.md`; no conventions update is needed for this CSS-only visual polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-final-polish.md`
