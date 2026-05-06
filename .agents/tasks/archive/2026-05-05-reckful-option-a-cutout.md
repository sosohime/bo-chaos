# Task Record: Reckful option A cutout

- State: completed
- Mode: full
- Started: 2026-05-05
- Branch: main
- Request: Rebuild `/reckful` from the cut design A assets with separate PC and mobile layouts.

## Acceptance Boundaries

- Functional: Keep the live retirement countdown, long-service secondary countdown, copy behavior, Roco welfare CTA, and `返回袁博` link.
- Desktop: Use `design-a-pc.png` as the PC visual base and overlay only the live countdown/actions so the page follows the `572 x 789` card design A.
- Mobile: Use `design-a-mobile.png` as the mobile visual base and overlay only the live countdown/actions so the page follows the `156 x 789` narrow design A.
- Privacy: Do not add concrete role/company/team copy.
- Verification: Run headed visual acceptance, inspect PC/mobile screenshots, run Astro build, and run `pnpm agent:lint`.
- Docs Sync: Update docs only if commands/workflow change.
- Safety: Local Astro UI/assets only; no production writes, deploys, external service actions, auth/security changes, or secrets.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record after confirming the implementation should use the local cut design A assets.
- Cut the provided design A into local reference assets:
  - `apps/frontend-astro/src/assets/reckful/reference/design-a-pc.png`
  - `apps/frontend-astro/src/assets/reckful/reference/design-a-mobile.png`
- Rebuilt `apps/frontend-astro/src/components/tuixiu/reckful/index.astro` around the PC/mobile cutout assets.
- Kept the live countdown overlay, made the design buttons clickable via transparent hit areas, and pointed the welfare CTA to `https://rocom.qq.com/cp/a20260303welfare/`.
- Added ARIA labels for the transparent CTA/return hit areas so the links remain discoverable without adding visible personal-role copy.
- Replaced the component references with 4x upscaled cutout assets to reduce retina/display scaling blur:
  - `apps/frontend-astro/src/assets/reckful/reference/design-a-pc@4x.png`
  - `apps/frontend-astro/src/assets/reckful/reference/design-a-mobile@4x.png`

## Iteration Log

- User asked to execute the design A cutout approach after comparison showed the current layout was the wrong horizontal dashboard skeleton.
- Verified that repainting the buttons in DOM caused duplicate visual layers; switched to cutout-native button visuals plus transparent live link overlays.
- Browser-use Node REPL tool was not available after tool discovery, so final visual evidence used the project headed Chrome harness.

## Deferred Verification

- None.

## Decisions and Assumptions

- Route is `apps/frontend-astro` under the retirement countdown/Astro row.
- Use cut images for static visual fidelity, keep only countdown/actions live.

## Files Touched

- `.agents/tasks/archive/2026-05-05-reckful-option-a-cutout.md`
- `apps/frontend-astro/src/assets/reckful/reference/design-a-pc.png`
- `apps/frontend-astro/src/assets/reckful/reference/design-a-mobile.png`
- `apps/frontend-astro/src/components/tuixiu/reckful/index.astro`

## Verification Evidence

- `pnpm visual:reckful` passed all configured headed Chrome viewports:
  - `mobile-390`
  - `desktop-edge-900`
  - `desktop-retina-1024`
  - `desktop-1100`
  - `desktop-retina-1100`
  - `desktop-retina-1434`
  - `desktop-retina-1434x700`
  - `desktop-1440`
- Final visual output: `/private/tmp/bo-chaos-visual/reckful/2026-05-05T14-38-40-342Z/summary.json`
- 4x asset follow-up visual output: `/private/tmp/bo-chaos-visual/reckful/2026-05-05T15-24-59-393Z/summary.json`
- Key screenshots:
  - `/private/tmp/bo-chaos-visual/reckful/2026-05-05T14-38-40-342Z/desktop-retina-1434x700.png`
  - `/private/tmp/bo-chaos-visual/reckful/2026-05-05T14-38-40-342Z/mobile-390.png`
- `pnpm -C apps/frontend-astro build` passed. Sentry auth token and stale Browserslist warnings were emitted by existing build tooling.
- `pnpm agent:lint` exited 0 with warning `agents-toc-check` because agent docs changed without `AGENTS.md` changing; AGENTS.md still links the same L2 docs, so no L1 TOC edit was made for this scoped UI task.
- Re-ran `pnpm -C apps/frontend-astro build` and `pnpm agent:lint` after the 4x asset swap with the same build/tooling warnings.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/2026-05-05-reckful-option-a-cutout.md`
