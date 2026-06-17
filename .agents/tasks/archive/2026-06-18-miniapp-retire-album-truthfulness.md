# Task Record: miniapp retire and album truthfulness

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Fix nonsensical retirement homepage info and remove fake lazy-loaded album tab counts.

## Acceptance Boundaries

- Functional: retirement page only shows explainable countdown/progress information; category headers no longer display loaded-count numbers as if they were totals.
- Verification: mini app build and agent lint.
- Docs Sync: no architecture or conventions changes required; this is a UI correctness fix within existing mini app behavior.
- Safety: no production writes, data changes, or secrets.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Simplified the retirement page copy to target date, remaining time, and progress.
- Removed derived weekly/monthly/yearly metric cards and observed-day copy.
- Simplified share text to countdown and target date.
- Removed category header loaded-count display from grouped photo sections.
- Removed unused `.photo-count` styles.

## Iteration Log

- Not applicable.

## Deferred Verification

- WeChat DevTools visual preview was not rerun in this pass.

## Decisions and Assumptions

- Per-category counts should not be shown until the backend exposes category-level totals; using the number of loaded photos is misleading under lazy loading.
- The retirement page should avoid derived labels that do not map directly to a product rule or visible countdown.

## Files Touched

- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `apps/miniapp-taro/src/features/photos/CategoryPhotoSections.tsx`
- `apps/miniapp-taro/src/features/photos/photo-browser.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-retire-album-truthfulness.md`

## Verification Evidence

- `rg` over retirement page and photo features: no active `photo-count`, loaded category count, weekly/monthly/yearly retirement metric, observed-day, or old cycle copy remains.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: initially warned for mini app convention sync; `docs/agent/CONVENTIONS.md` was updated with the count and retirement-page rules.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-album-truthfulness.md`
