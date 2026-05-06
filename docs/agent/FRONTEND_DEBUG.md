# Agent Frontend Debug Workflow

Use this when changing or debugging admin, Astro, or browser-rendered UI.

## Preferred Flow

1. Identify the app with `docs/agent/ROUTING.md`.
2. Start the relevant dev server.
3. Open the local URL with Browser Use when available.
4. Check rendered state, console errors, network failures, and responsive layout.
5. If the verification needs to be repeated, write a small Playwright script.

Local frontend debugging is autonomous work. Do not ask the user before starting/stopping local dev servers, checking ports, opening `localhost` / `127.0.0.1`, reading console logs, taking screenshots, or running local `curl -I` checks.

## Local Targets

| App        | Command                               | URL                               |
| ---------- | ------------------------------------- | --------------------------------- |
| Admin Next | `pnpm -C apps/front-next-admin dev`   | `http://localhost:3001/rpg/admin` |
| Astro      | `pnpm -C apps/frontend-astro dev`     | `http://localhost:4321`           |
| Backend    | `pnpm -C apps/backend-nest start:dev` | `http://localhost:3000`           |

## Astro Static Data

- `/bo` renders Lighthouse activity links from `apps/frontend-astro/src/data/lighthouse-activities.json`.
- Refresh the data with `pnpm update:lighthouse-news` before build-only checks when the task touches the news/activity section.
- The refresh script only performs public read requests to Tencent Cloud and should not submit forms or call console APIs.
- The refresh script should prioritize product capability signals such as AI Agent, one-click deployment, public beta, product experience, and best practices over generic pricing promotions.
- Astro dev/preview responses set `Cache-Control: no-store` to avoid stale Vite chunks in external Chrome during iterative UI work.

## Admin Production API Hazard

`apps/front-next-admin/next.config.ts` currently rewrites `/api/:path*` to:

`https://yuanbo.online/rpg/bofans/:path*`

Because of this:

- Do not perform admin UI actions that create, update, approve, reject, upload, or delete real data unless the user explicitly approves.
- Read-only page loading and screenshot checks are okay.
- For write-flow testing, prefer mocking, a local backend rewrite, or a test environment in a separate approved change.

## Browser Use Checklist

- Navigate to the relevant route.
- Wait for the page to settle.
- Inspect visible UI state and console.
- Capture a screenshot when visual layout matters.
- Try keyboard navigation for changed controls.
- Report anything blocked by auth or production API safety.
- Keep dev servers under agent control and stop any server started for verification before finishing, unless the user explicitly wants it left running.
- Use Browser Use / the in-app browser for localhost visual checks when available. Do not jump to external Chrome/headless screenshots unless Browser Use is unavailable or the user explicitly approves a fallback.
- If Astro dev serves stale markup or styles after a component rewrite, restart the Astro dev server before diagnosing the rendered page. Record the restart and stale-state evidence in the task record.

## Mockup-Driven Responsive Checks

Use this when implementing an Image2/Figma/reference design that includes separate desktop and mobile compositions:

- Before coding, record desktop and mobile acceptance boundaries in the task record.
- Treat desktop and mobile as first-class layouts that share content, not as one layout squeezed with late media-query fixes.
- Verify that the desktop view and mobile/narrow view both match the selected reference direction in structure, hierarchy, and content order before visual polish.
- Do not mark the task complete if either target viewport has obvious overflow, clipped titles, missing primary actions, or modules that fall out of the intended order.
- If Browser Use cannot resize to the needed viewport, state that limitation in the task record and use a user-adjusted browser width or an explicitly approved fallback.

## Visual Fast Lane Checklist

Use this checklist for repeated visual micro-iterations on one page or component:

- Record the current route and viewport class, such as mobile, iPad, desktop, or the exact browser size when known.
- Name the target region being changed and the frozen regions that must not change.
- Keep text semantics and interactive behavior stable unless the user explicitly asks otherwise.
- Check console after each local reload.
- Use screenshots or DOM checks when alignment, overflow, copied text, or responsive behavior matters.
- Defer full build and `pnpm agent:lint` until the user accepts the visual result, scope changes, or the turn ends.

Exit Visual Fast Lane if the change touches behavior, data fetching, routing, cache settings, package/config files, copy logic, shared components, or multiple apps.

## Playwright Pattern

Use Playwright when the workflow should be repeatable:

- Wait for `networkidle` before DOM inspection on dynamic pages.
- Discover selectors from rendered output before acting.
- Prefer role/text selectors when possible.
- Keep scripts focused on the changed behavior.
- Close browsers and stop servers after verification.
