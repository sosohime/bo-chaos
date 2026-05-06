# Task Record: Reckful Roco theme

- State: completed
- Mode: full
- Started: 2026-05-04
- Branch: main
- Request: Redesign the Reckful retirement countdown page with Roco Kingdom: World elements and update the acceleration link.

## Acceptance Boundaries

- Functional: `/reckful` follows Image2 option A only: an open-world progress-map page with title, long-service ribbon, objective-style countdown, route markers, primary acceleration CTA, return action, journey tasks, and world status panels.
- Desktop: common desktop view must match option A's structure and hierarchy: map is the dominant visual surface; countdown and CTAs sit as integrated game UI over the map; tasks/status belong to the same board system rather than generic white cards.
- Mobile: narrow view must be a purpose-built single-column composition matching option A's mobile direction: map/title first, readable countdown objective card, full-width CTA and return action, then compact task/status modules; no horizontal scroll, clipped title, missing primary action, or squeezed desktop layout.
- Copy/privacy: keep concrete personal role/company/team wording out of visible and meta copy; use generic world/status/progress language for professional flavor.
- Behavior: keep live main countdown, secondary long-service countdown, copy countdown behavior, `返回袁博`, and set the acceleration link to `https://rocom.qq.com/cp/a20260303welfare/`.
- Verification: Run Astro build, inspect `/reckful` locally with Browser Use/in-app browser for visible state and console logs, verify responsive behavior or record viewport limitations, and run `pnpm agent:lint`.
- Docs Sync: Update docs when workflow or convention gaps are discovered; this task updates frontend debug and Astro conventions.
- Safety: Local Astro UI/docs only; no production writes, deploys, pushes, auth changes, or real external activity-page actions.
- Archive: Move this record to `.agents/tasks/archive/` before the final response.

## Actions

- Read routing, frontend debug, conventions, quality gates, relevant task archives, current Reckful page, Bo page, and countdown component.
- Opened the official Roco welfare page to confirm current link/content motifs.
- Generated an original open-world map hero background with image2 and copied it into the Astro app assets.
- Rebuilt `/reckful` around the selected option A responsive progress-map direction.
- Removed explicit personal role/position wording from visible page content and page meta.
- After user feedback, replaced the rough shared layout with a design-A-style board structure: map stage, countdown objective card, CTA actions, route markers, journey tasks, and world status panels.
- Restarted the Astro dev server after HMR served stale markup, then verified the in-app browser loaded the new structure.
- Tightened the mobile layout so the map/title, countdown card, and primary CTA fit as a planned mobile composition rather than a squeezed desktop layout.
- User identified that the work was not following repo workflow: responsive acceptance boundaries and Browser Use/HMR lessons were missing from docs and task records.
- Loaded `bo-chaos-doc-sync` and updated `docs/agent/FRONTEND_DEBUG.md` and `docs/agent/CONVENTIONS.md` before continuing page implementation.
- After the user approved non-headless Playwright/browser verification, used a temporary Playwright environment in `/private/tmp` with headed Chrome and a `1440 x 1100` viewport for desktop visual verification.
- Tightened the desktop dock alignment after the first desktop screenshot showed the left journey-task panel being stretched by the taller status panel.
- Removed the desktop mini-map from the status dock and increased task-cell height so the desktop bottom dock stays compact and balanced.
- User provided a real Chrome 1100px screenshot showing the previous headed Playwright check did not reproduce the same Retina/browser density; tightened the `900-1160px` narrow-desktop rules by reducing title/countdown scale and compacting the objective actions.
- Added the repeatable `pnpm visual:reckful` headed-Chrome acceptance harness and documented it in `docs/agent/COMMANDS.md`.
- User clarified the real failing browser size was `1434 x 700`; added that exact Retina viewport to the visual harness and tightened short-height desktop CSS.
- Fixed the final `1100 x 650 @2x` short/narrow failure by raising the objective card inside the map stage rather than relaxing acceptance checks.

## Iteration Log

- Not using visual-fast-lane because this changes page structure, external links, public route content, docs, and verification workflow.

## Deferred Verification

- None.

## Decisions and Assumptions

- Route is `apps/frontend-astro` under the retirement countdown/Astro row.
- Use official Roco welfare content only as visual/content inspiration and a normal outbound link; do not implement login, lottery, sharing, or activity actions.
- Keep the shared Astro countdown script unchanged unless visual integration requires small prop/class additions; style it from the page shell.
- Do not show a top navigation bar; keep the two links as CTA actions below the countdown.
- Express professional/game-runtime elements through task/status panels only, without stating a concrete role.
- Treat desktop and mobile as separate first-class layouts that share content, not one desktop composition squeezed with media queries.
- Use Browser Use/in-app browser for local visual checks; do not use headless Chrome unless Browser Use is unavailable or the user approves a fallback.
- If Astro dev serves stale markup after a rewrite, restart the dev server and record it as verification evidence before diagnosing layout.

## Files Touched

- `.agents/tasks/archive/2026-05-04-reckful-roco-theme.md`
- `docs/agent/COMMANDS.md`
- `docs/agent/FRONTEND_DEBUG.md`
- `docs/agent/CONVENTIONS.md`
- `apps/frontend-astro/src/assets/reckful/open-world-map.png`
- `apps/frontend-astro/src/components/tuixiu/countdown.astro`
- `apps/frontend-astro/src/components/tuixiu/reckful/index.astro`
- `apps/frontend-astro/src/pages/reckful.astro`
- `scripts/visual-reckful.mjs`
- `package.json`
- `pnpm-lock.yaml`

## Verification Evidence

- `zsh -lc 'pnpm -C apps/frontend-astro build'` passed.
- Browser Use / in-app browser refreshed `http://127.0.0.1:4321/reckful?tight=1777846019112`; page title and URL matched the route.
- Browser console warnings/errors from `tab.dev.logs({ levels: ['error','warning'] })`: `[]`.
- Browser Use visible screenshot checked the current narrow viewport: title/map, route markers, objective countdown card, primary CTA, return action, journey tasks, and world status are present in the planned order with no visible horizontal overflow or clipped controls.
- Direct desktop-width Browser Use verification is limited by the current in-app browser viewport and available API surface; the desktop layout was instead checked with headed Playwright Chrome at `1440 x 1100`.
- Headed Playwright desktop screenshot saved to `/private/tmp/reckful-desktop-playwright.png`; first pass found excess blank space in the left dock panel, then CSS was tightened.
- Final headed Playwright desktop screenshot saved to `/private/tmp/reckful-desktop-playwright-3.png` at `1440 x 1100`; desktop map, objective card, route markers, CTA actions, journey tasks, and status dock are visible with no overlap or clipped text. The remaining 404 console entry is the existing missing favicon request (`/retire/bo.ico`), not a page runtime error.
- Headed Playwright narrow-desktop screenshot saved to `/private/tmp/reckful-desktop-1100.png` at `1100 x 1000`; the desktop layout remains usable near the breakpoint with title, objective card, route markers, CTA actions, journey tasks, and status dock still fitting without visible overlap or clipped text.
- A final in-app Browser Use narrow recheck was attempted after desktop tightening, but Browser Use timed out and reset its Node REPL kernel twice. Previous narrow viewport evidence remains valid for the unchanged mobile-specific rules; desktop was verified with headed Playwright Chrome.
- `zsh -lc 'pnpm agent:lint'` exited 0 with `agents-toc-check` warning because L2 docs changed while `AGENTS.md` did not; no new or renamed docs were added, so the L1 table of contents remains current.
- `zsh -lc 'pnpm visual:reckful'` passed headed Chrome visual acceptance for `mobile-390`, `desktop-edge-900`, `desktop-retina-1024`, `desktop-1100`, `desktop-retina-1100`, `desktop-retina-1434`, exact `desktop-retina-1434x700`, and `desktop-1440`.
- Visual summary: `/private/tmp/bo-chaos-visual/reckful/2026-05-04T16-19-20-443Z/summary.json`.
- Exact `1434 x 700 @2x` metrics: title/card gap `65px`, objective bottom `550px`, map bottom `583px`, dock hint `117px`.
- Final short/narrow `1100 x 650 @2x` metrics: objective bottom `503px`, map bottom `503px`, dock hint `147px`.
- `zsh -lc 'pnpm -C apps/frontend-astro build'` passed after the final CSS change.
- `zsh -lc 'pnpm agent:lint'` exited 0 after `COMMANDS.md` sync; only `agents-toc-check` remains because existing L2 docs changed but no new or renamed docs require an `AGENTS.md` TOC update.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/2026-05-04-reckful-roco-theme.md`
