# Task Record: miniapp photo browser rails

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by removing remaining decorative rails in shared photo browser surfaces.

## Acceptance Boundaries

- Functional: Remove decorative left rails from shared photo browser headers and category rows while preserving photo browser status, category expand/collapse, pagination labels, lazy images, and retry behavior.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers this pattern or update docs if a durable new rule is introduced.
- Safety: Do not change photo APIs, category selection behavior, pagination, image URL normalization, production API target, secrets, UGC behavior, or page routes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected shared photo browser styles and found remaining decorative rail treatments in page heads, browser title blocks, and category headers.
- Removed `photo-console-head` left rail pseudo-element and tightened the page header type scale.
- Removed `photo-browser-title-block` left border accent.
- Removed the `category-rail` node from grouped photo sections and deleted its active-state style.
- Reworked category expand/collapse state into a quiet bordered status chip.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: shared photo browser should present real resource status and category selection without decorative campaign-like accents.
- Primary state: current browser/category status and selected category.
- Source of truth: existing loading/hasMore/activeCategory state remains unchanged.
- Removal target: decorative left rails and border-left title accent.
- Closest Tencent Cloud pattern: resource header, status chip, and quiet expandable resource rows.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-photo-browser-rails.md`
- `apps/miniapp-taro/src/features/photos/CategoryPhotoSections.tsx`
- `apps/miniapp-taro/src/features/photos/photo-browser.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro emitted existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Photo browser rail anti-slop scan for fake AI/marketing copy, hard-coded retirement labels, stale image/load copy, old color tokens, forbidden glow/gradient terms, `category-rail`, `border-left`, and left-rail geometry: no matches.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers compact resource rows and no new convention was introduced.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-browser-rails.md`
