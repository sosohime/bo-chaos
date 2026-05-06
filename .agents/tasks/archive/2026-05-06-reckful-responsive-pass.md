# Task Record: Reckful responsive pass

- State: archived
- Mode: visual-fast-lane
- Started: 2026-05-06
- Branch: main
- Request: Continue responsive layout adaptation after the desktop direction became acceptable.

## Acceptance Boundaries

- Keep the improved desktop full-width map direction intact.
- Improve narrow desktop/tablet task and status density.
- Improve small mobile route composition so the companion does not collide with route labels.
- Expand repeatable visual coverage for small mobile, tablet, and 1280 desktop.

## Actions

- Added visual harness coverage for `mobile-360`, `mobile-430`, `tablet-768`, and `desktop-1280`.
- Added a `900px-1050px` layout where the dashboard stacks and task cards become a 2x2 grid.
- Added a `640px-899px` tablet layout where task cards are 2x2 and status cards are one row.
- Reduced mobile title/countdown scale and moved the small-mobile current route node away from the companion image.
- Fixed mobile hero background coverage so the generated map image spans the full hero and route section instead of stopping at a fixed `42rem` height.
- Reworked the small-mobile layout toward design A: framed mobile shell, hidden progress-map badge, tighter countdown/actions, compact task rows, icon-like mobile task markers, and four-column status cells.
- Removed the small-mobile waypoint label cards, moved the companion into the lower-right map area, cleared the mobile map wash, and converted the mobile route area from a card into a direct map segment.
- Increased the small-mobile route segment and inset task/status panels so the page reads more like the vertical design A panel rather than ordinary stacked web cards.

## Verification Evidence

- `pnpm visual:reckful`: passed for `mobile-360`, `mobile-390`, `mobile-430`, `tablet-768`, `desktop-edge-900`, `desktop-retina-1024`, `desktop-1100`, `desktop-retina-1100`, `desktop-1280`, `desktop-retina-1434`, `desktop-retina-1434x700`, and `desktop-1440`.
- Latest visual summary: `/private/tmp/bo-chaos-visual/reckful/2026-05-06T13-31-44-257Z/summary.json`.
- `pnpm -C apps/frontend-astro build`: passed. Sentry auth-token warnings only.
- `pnpm agent:lint`: passed with the existing `agents-toc-check` warning that agent docs changed without `AGENTS.md` changing.

## Handoff / Archive Notes

- Final state: completed.
