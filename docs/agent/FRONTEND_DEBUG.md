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
- The Astro deploy job uploads `dist/` to server path `retire`, so `public/foo.png` is served as `/retire/foo.png` online. Do not put files under `public/retire/`; use `sitePath('/foo.png')` in source.
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

## Image-Heavy Admin Pages

- Prefer backend pagination and browser-native image lazy loading for review queues before adding heavier virtualized table dependencies.
- Verify page controls and loading/empty states without approving or rejecting production data.

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

## Miniapp WeChat Visual Verification

Use this before accepting broad Taro mini app UI changes, especially tab bar, photo feeds, upload/review flows, retirement, kowtow, or runtime-config visibility work.

1. Build against the intended API target:

   `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`

2. Open the compiled mini app in WeChat DevTools.

   If the local DevTools service port is already enabled, this command can open the project:

   `/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project /Users/heyesheng/Documents/code/github/bo-chaos/apps/miniapp-taro --lang zh`

   If DevTools prompts to enable its service port, stop and record that blocker instead of enabling the setting autonomously. It is a local tool security setting, not a normal repo command. Manual verification can still open `/Applications/wechatwebdevtools.app` and the project at `/Users/heyesheng/Documents/code/github/bo-chaos/apps/miniapp-taro`.

3. Capture first-viewport and bottom-tab evidence for the changed pages. For broad mini app visual refactors, inspect at least:

   - `/pages/retire/index`
   - `/pages/kowtow/index`
   - `/pages/history/index`
   - `/pages/travel/index`
   - `/pages/my/index`
   - `/pages/approve/index`
   - `/pages/tease/index` when visible or reachable

4. Save screenshots or screen recordings under `.agents/artifacts/miniapp-visual/YYYY-MM-DD/` when the verification produces local files. Record the path in the task record.

5. Check runtime-config visibility. When `miniapp.ugc.enabled=false`, UGC tabs, upload/review entry points, upload history, and UGC fetches should be hidden or skipped consistently.

6. Judge the screenshots against the BoChaos mini app product-console direction:

   - The screen should read closer to a Tencent Cloud product console than to a public marketing page or generated concept mockup.
   - Active and inactive tab states should keep stable size, rhythm, and icon weight.
   - Photo-heavy pages should use `Image lazyLoad`, paginated fetches, and designed loading, empty, error, retry, and footer states.
   - Counts, progress text, badges, and tab labels must come from backend data, runtime config, shared constants, or visible local queue state.
   - Retirement copy must use shared countdown constants and avoid exposing internal rule math or invented filler metrics.
   - Image URLs should load from the current `yuanbo.online` service path where production media is expected.
   - Decorative AI or image-slice assets must clarify a concrete state; remove glow, fake diagnostics, fake dashboards, or sales-style showpieces.

Treat build success, source scans, and style scans as partial evidence. Real WeChat DevTools or device screenshots are the preferred acceptance evidence for broad mini app UI work.

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
