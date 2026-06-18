# Task Record: miniapp retire kowtow console polish

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud product-console feel with restrained AI/tech polish.

## Acceptance Boundaries

- Functional: Preserve retirement countdown math from shared constants, kowtow interaction behavior, API calls, runtime config, and navigation.
- Visual: Tighten first-screen retirement and kowtow surfaces into calm product-console status panels without fake metrics or marketing hero composition.
- Safety: No production writes, no API target changes, no secrets, no auth/runtime behavior changes.
- Verification: Run source scans, `git diff --check`, WeChat mini app build, and `pnpm agent:lint`.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Design Diagnosis

- Screen job: retirement page should communicate canonical countdown/progress state; kowtow page should let users record an interaction and inspect honest sync/status feedback.
- Primary state: retirement date/progress and kowtow submit/readiness state.
- Source of truth: `@mono/const` retirement constants, page-local countdown derivations, kowtow API responses, and local queue/sync state.
- Current weak points: pending source inspection.
- Removal target: any remaining hero-like, fake-tech, or internal implementation language above the fold.

## Actions

- Read retirement and kowtow page TSX/SCSS plus the shared BoSheng event reminder component.
- Diagnosed retirement first-screen fact cards as partly duplicating the detail panel, and kowtow first-screen order as allowing a conditional event reminder to appear before the primary interaction status.
- Reworked the retirement fact grid to show remaining days, progress percent, and target date from existing shared-constant countdown data.
- Moved the conditional BoSheng reminder below the kowtow status console and tightened kowtow section labels to interaction/status language.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final broad visual acceptance if the tool window becomes available.

## Decisions and Assumptions

- Do not add generated image slices unless a concrete state illustration need appears; current target is hierarchy and product-console tone.

## Files Touched

- apps/miniapp-taro/src/pages/retire/index.tsx
- apps/miniapp-taro/src/pages/kowtow/index.tsx

## Verification Evidence

- Source scan found no retirement-rule leakage such as "15", "十五", "腾讯", "入职", or fake-tech labels in touched retirement/kowtow page source; matches were only numeric style/canvas coordinates.
- `pnpm exec prettier --write apps/miniapp-taro/src/pages/retire/index.tsx apps/miniapp-taro/src/pages/kowtow/index.tsx .agents/tasks/active/2026-06-18-miniapp-retire-kowtow-console-polish.md` passed.
- `git diff --check` passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro/Webpack compiled successfully.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because mini app source changed without `docs/agent/CONVENTIONS.md`; no conventions update is needed for this source-only visual/copy polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-kowtow-console-polish.md`
