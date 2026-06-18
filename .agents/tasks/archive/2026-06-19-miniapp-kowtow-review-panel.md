# Task Record: miniapp kowtow review panel

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Refine the kowtow page review-mode panel from plain step text into a console-style service state panel while preserving review-mode copy intent and runtime behavior.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change runtime config semantics, page routes, API calls, production API target, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed the kowtow page and identified the review-mode panel as a remaining plain instruction block.
- Replaced numbered review-mode steps with a service status header and compact property rows.
- Preserved the existing review-mode copy intent around image classification, upload review, compression, and category viewing.
- Left normal kowtow interaction, stats syncing, canvas animation, and API behavior unchanged.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification unless DevTools becomes available.

## Decisions and Assumptions

- Screen job: in review mode, present the page as an image-processing service surface.
- Primary state: service flow is available and review-safe.
- Source of truth: existing `systemConfig.inReview` branch and existing static review-mode copy.
- Removal target: numbered plain text steps inside `kowtow-review-steps`.
- Closest Tencent Cloud pattern: service status panel with primary state and compact property rows.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-kowtow-review-panel.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across My, approval, kowtow, retirement, history, travel, tease, shared photo browser, custom tab bar, and photo item source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-kowtow-review-panel.md`
