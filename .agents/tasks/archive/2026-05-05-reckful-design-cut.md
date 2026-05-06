# Task Record: Reckful design cut

- State: completed
- Mode: full
- Started: 2026-05-05
- Branch: main
- Request: Fix the broken return icon and re-cut the Reckful page from the design reference, including mobile layout.

## Acceptance Boundaries

- Functional: `返回袁博` icon renders cleanly and the link behavior remains unchanged; `充值加速退休进度` continues to point to the Roco welfare URL.
- Desktop: Cut the option-A design structure instead of patching the current approximation: large map board, left title/objective command card, right route markers, bottom task/status dock, no top nav, no explicit role/company/personal job copy.
- Mobile: Use a design-specific mobile composition: title/map signal first, countdown card readable without desktop squeezing, full-width primary/secondary actions, route/status/task modules in the intended order, no horizontal scroll or clipped controls.
- Verification: Run the headed visual harness and inspect desktop/mobile screenshots; run Astro build and `pnpm agent:lint`.
- Docs Sync: Update docs only if the workflow or command surface changes.
- Safety: Local Astro UI only; no production writes, deploys, external activity actions, auth/security changes, or secrets.
- Archive: Move this record to `.agents/tasks/archive/` before the final response.

## Actions

- Read `AGENTS.md`, task routing, frontend debug workflow, current Reckful implementation, visual harness, and available image/design artifacts.
- Confirmed `/Users/soso/Downloads/已生成图像 1.png` is the available option-A design reference: desktop left map card and narrow mobile card.
- Re-cut `apps/frontend-astro/src/components/tuixiu/reckful/index.astro` around the option-A structure: large map hero, left title/ribbon/countdown command card, right route markers, companion visual, full-width task panel, and full-width status panel with mini-map.
- Fixed the `返回袁博` icon by replacing the broken return glyph with a clean inline SVG back/return arrow.
- Updated the map countdown variant to include the visible `天 / 时 / 分 / 秒` label row used by the design reference.
- Iterated against the headed Chrome visual harness after the first pass exposed desktop title/card overlap and short-height clipping.
- Adjusted desktop, short-height desktop, and mobile-specific proportions to pass hard layout checks while staying closer to the design reference.

## Iteration Log

- User reported the return icon is broken and the current UI still does not restore the design, especially mobile. User asked to first cut the design reference.

## Deferred Verification

- None yet.

## Decisions and Assumptions

- Route is `apps/frontend-astro` under the retirement countdown/Astro row.
- Treat `/Users/soso/Downloads/已生成图像 1.png` as the available design reference unless a more specific design artifact is found.
- Keep the generated local map asset as the primary visual asset; implement the design reference as real HTML/CSS so the countdown and links remain live.
- Keep the long-service secondary countdown visible but compact, even though the reference mockup omits that dynamic line.

## Files Touched

- `.agents/tasks/archive/2026-05-05-reckful-design-cut.md`
- `apps/frontend-astro/src/components/tuixiu/reckful/index.astro`
- `apps/frontend-astro/src/components/tuixiu/countdown.astro`

## Verification Evidence

- `curl -I http://127.0.0.1:4321/reckful`: 200 OK from the Astro dev server.
- `zsh -lc 'pnpm visual:reckful'`: first pass failed on desktop title/objective overlap and short-height clipping; used those failures to resize/reposition the cut.
- `zsh -lc 'pnpm visual:reckful'`: final pass succeeded for `mobile-390`, `desktop-edge-900`, `desktop-retina-1024`, `desktop-1100`, `desktop-retina-1100`, `desktop-retina-1434`, exact `desktop-retina-1434x700`, and `desktop-1440`.
- Visual summary: `/private/tmp/bo-chaos-visual/reckful/2026-05-04T16-38-25-789Z/summary.json`.
- Final screenshots inspected: `/private/tmp/bo-chaos-visual/reckful/2026-05-04T16-38-25-789Z/desktop-retina-1434x700.png` and `/private/tmp/bo-chaos-visual/reckful/2026-05-04T16-38-25-789Z/mobile-390.png`.
- Final `1434 x 700 @2x` metrics: title/objective gap `91px`, objective bottom `514px`, map bottom `541px`.
- Final `390 x 1100 @2x` metrics: objective follows title with `61px` gap and no horizontal overflow.
- `zsh -lc 'pnpm -C apps/frontend-astro build'`: passed.
- `zsh -lc 'pnpm agent:lint'`: exited 0 with only `agents-toc-check`; no new or renamed L2 docs were added, so `AGENTS.md` remains current.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-05-reckful-design-cut.md`
