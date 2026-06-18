# Task Record: miniapp kowtow action console

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward Tencent Cloud product-console quality by restructuring the kowtow interaction page.

## Acceptance Boundaries

- Functional: Kowtow page should keep existing stats sync, local queue, carousel, Canvas feedback, and review-mode behavior while making the first screen read as a compact interaction resource console.
- Verification: Run mini app WeApp build with production API base, `git diff --check`, anti-slop scan on touched files, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if no L2 doc changes are needed.
- Safety: Do not change API calls, sync interval, local-storage key, runtime review behavior, tab routing, or production API target.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Design Diagnosis

- Screen job: Show current interaction stats and let the user write one local interaction record with clear sync state.
- Primary state: total count, today's participation, local queue, and the write action should be visible together.
- Cheap/noisy element: the separate operation panel pushes the main action below the image resource area and makes the page feel like stacked cards.
- Source of truth: backend kowtow stats, local queue count, sync failure state, and existing carousel index.
- Tencent Cloud reference pattern: resource summary table plus action footer and secondary resource preview.
- Tech allowance: precise status chips, grid dividers, and queue labels only; no fake intelligence claims or decorative image slice.

## Actions

- Read mini app and visual design skills plus relevant agent docs.
- Inspected kowtow TSX/SCSS and Swiper image component.
- Moved the local interaction write action from the separate lower panel into the main kowtow stats resource panel.
- Removed the old standalone action panel chrome and restyled the action area as a compact resource footer.
- Kept backend stats sync, local queue behavior, carousel, Canvas feedback, and review-mode behavior unchanged.

## Decisions and Assumptions

- No generated bitmap slice is used because the problem is hierarchy and action placement, not missing artwork.

## Files Touched

- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-kowtow-action-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed. Taro compiled successfully; Browserslist data warning is pre-existing/toolchain-related.
- `git diff --check` passed.
- Anti-slop scan on touched files passed with zero matches.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; L2 docs are unaffected because this is source-only visual polish and does not change conventions.
- WeChat DevTools or real-device visual inspection was not run in this turn, so broad final UI acceptance remains unverified.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-action-console.md`
