# Task Record: miniapp retire resource console

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward Tencent Cloud product-console quality with restrained tech feel, focusing on the retirement first screen.

## Acceptance Boundaries

- Functional: Retirement page first screen should read as a compact resource-state console: canonical countdown facts, progress, and primary actions visible without fake metrics or marketing chrome.
- Verification: Run mini app WeApp build with production API base, `git diff --check`, anti-slop scan on touched files, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if no L2 doc changes are needed.
- Safety: Do not change shared retirement constants, countdown math, production API target, tab routing, or copy that exposes private employment details.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Design Diagnosis

- Screen job: Show the current retirement countdown state and let the user copy/share the status or enter interaction.
- Primary state above the fold: remaining days plus live HH:mm:ss and canonical progress percent.
- Cheap/noisy element: separate command panel repeats console language and pushes important actions below the main resource state.
- Source of truth: `@mono/const` retirement dates and local `countdown` state only.
- Tencent Cloud reference pattern: resource detail summary with status chip, metric cells, progress row, and action bar.
- Tech allowance: precise state labels and grid/rule treatment only; no fake scan, halo effects, or generated image slice.

## Actions

- Read mini app and visual design skills plus relevant agent docs.
- Inspected retirement page TSX/SCSS and confirmed countdown facts are sourced from shared constants.
- Moved the copy and interaction actions into the main retirement resource console.
- Removed the separate command panel so the first screen presents status, metrics, progress, and actions as one product surface.
- Restyled the action area as a compact two-column console action bar.

## Decisions and Assumptions

- No generated bitmap slice is used here because the first-screen hierarchy needs native product UI, not decorative art.

## Files Touched

- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-retire-resource-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed. Taro compiled successfully; Browserslist data warning is pre-existing/toolchain-related.
- `git diff --check` passed.
- Anti-slop scan on touched files passed with zero matches.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; L2 docs are unaffected because this is source-only visual polish and does not change conventions.
- WeChat DevTools or real-device visual inspection was not run in this turn, so broad final UI acceptance remains unverified.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-resource-console.md`
