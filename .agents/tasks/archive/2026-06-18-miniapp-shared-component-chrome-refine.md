# Task Record: miniapp shared component chrome refine

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving shared mini app visual components toward the Tencent Cloud style direction.

## Acceptance Boundaries

- Functional: Preserve photo lazy loading, image retry, preview, save, voting, and BoSheng visibility behavior.
- Verification: Build the WeChat mini app, run agent lint, and check whitespace diffs.
- Docs Sync: No architecture or command docs expected for presentation/copy polish.
- Safety: No production writes, no API target changes, no secrets.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Diagnosed shared `PhotoItem` and `BoSheng` as retaining resource/sync language and decorative shadow that could leak across multiple pages.
- Replaced `PhotoItem` fallback/loading/error copy from resource/sync wording to image loading wording.
- Removed the decorative shadow from the `BoSheng` event reminder while preserving the white panel, border, rail, and status chip.
- Kept shared component props and user actions unchanged.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final visual acceptance if the tool window is available.

## Decisions and Assumptions

- Keep the shared component APIs unchanged.
- Use image loading language that describes actual `Image` load/error states.

## Files Touched

- apps/miniapp-taro/src/components/photoItem/index.tsx
- apps/miniapp-taro/src/components/boSheng/index.scss

## Verification Evidence

- `rg -n "图片资源|同步异常|box-shadow" apps/miniapp-taro/src/components/photoItem apps/miniapp-taro/src/components/boSheng`: no matches.
- `pnpm exec prettier --write apps/miniapp-taro/src/components/photoItem/index.tsx apps/miniapp-taro/src/components/boSheng/index.scss .agents/tasks/active/2026-06-18-miniapp-shared-component-chrome-refine.md`: passed.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist stale-data and Node punycode warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no docs update needed because this was source-only presentation/copy polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-shared-component-chrome-refine.md`
