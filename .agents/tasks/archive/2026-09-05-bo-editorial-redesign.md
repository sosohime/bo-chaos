# Task Record: Bo news and retirement editorial redesign

- State: completed
- Mode: full
- Started: 2026-09-05
- Branch: codex/bo-editorial-redesign-20260905
- Request: Recommend and implement a substantial redesign and optimization of 博新闻 and 博退休.

## Acceptance Boundaries

- Functional: Unified news, retirement and public-profile experience; searchable source-backed news, durable editorial detail URLs, RSS; second-resolution countdown, honest instant copy, progress and focus mode. Preserve all existing public routes, source claims, canonical Person identity, and shared retirement target.
- Verification: Public-data refresh, relevant data/countdown boundary tests, Astro build, desktop/mobile and light/dark browser checks, SEO/links/RSS checks, agent lint.
- Docs Sync: Update Astro architecture, routing and frontend-debug conventions; use bo-chaos-doc-sync before completion.
- Safety: Isolated worktree from origin/main a1fcb6f protects the dirty original checkout. No backend, auth, production-target or deployment configuration changes.
- Archive: Archive on completion/handoff with evidence.

## Actions

- Audited existing content and SEO: root is a flat list of 8 sources; retirement has unrelated terminal decoration and a 16ms timer; copy simulates AI with a random 2–5-second delay.
- Current checkout is codex/zym-sticker with many overlapping uncommitted changes. Created isolated main-based worktree /private/tmp/bo-chaos-editorial.eI43vj and reused local dependencies by symlink.
- System git is blocked by Xcode loader failure; used /Library/Developer/CommandLineTools/usr/bin/git.
- Refreshed public Lighthouse page; content unchanged, timestamp retained at 2026-09-04.
- Read task-routing and design-taste-frontend. Design read: independent technology editorial for BoFans, native Astro/CSS, cobalt accent retained; DESIGN_VARIANCE 6, MOTION_INTENSITY 3, VISUAL_DENSITY 4. Semantic tokens, 12px surfaces / 6px controls, system fonts, reduced-motion support.
- Used built-in imagegen for two original conceptual editorial illustrations: cobalt lighthouse on a cool-white island; cobalt lounge chair facing a pale sea. No likeness, logos or simulated evidence. Optimized responsive WebP assets are saved in `apps/frontend-astro/public/editorial/`.
- Rebuilt news, retirement, profile and curated detail pages around shared native Astro components and semantic light/dark tokens. Removed the legacy Tailwind import from these surfaces; existing game/other pages and telemetry remain intact.
- Added eight searchable records, four category filters, URL/history restoration, five permanent record URLs, source-context notes, RSS and sitemap entries from a shared source model.
- Added second-aligned, visibility-aware countdown updates, UTC+8 milestones, terminal/progress bounds, instant copy with manual fallback, and keyboard-exitable focus mode with inert background restoration.
- Performance audit identified unnecessary CSS, oversized mobile image selection and an action-loading layout shift; addressed each and rechecked the production-layout build.

## Decisions and Assumptions

- Main scope is apps/frontend-astro; shared constants consumed without changing dates or policy.
- Product observations carry an observation date, not a fabricated publication date. Durable detail pages cover the existing curated source records; volatile product links remain outbound.
- Preserve /, /retire/bo/, /retire/yuanbo/ and existing anchor IDs. News remains fan-maintained and non-official. Retirement target is explicitly a community countdown setting, not a verified employment announcement.
- No new runtime framework, network API, database or animation dependency is needed.

## Files Touched

- Astro pages: `index.astro`, `bo.astro`, `yuanbo.astro`, `news/[slug].astro`, `rss.xml.ts`, `sitemap.xml.ts`.
- Shared UI: `components/editorial/{SiteShell,NewsExplorer,RetirementClock,CommunityLinks}.astro`, `styles/editorial.css`, `layouts/Layout.astro`.
- Data/helpers: `data/news.ts`, `data/news.test.ts`, `lib/{retirement,retirement.test,clipboard,site-paths}.ts`.
- Four responsive illustration assets in `public/editorial/`; app `package.json` and read-only `scripts/preview-production.mjs`.
- Agent architecture, routing, conventions, commands and frontend-debug docs; `openspec/changes/bo-editorial-redesign/proposal.md`; this task record.

## Illustration Handoff

- Lighthouse: `apps/frontend-astro/public/editorial/lighthouse.webp` (1200×800, 46,042 bytes), `lighthouse-small.webp` (800×533, 21,668 bytes).
- Retirement: `apps/frontend-astro/public/editorial/retirement.webp` (1200×800, 68,208 bytes), `retirement-small.webp` (800×533, 33,132 bytes).
- Lighthouse prompt: sophisticated editorial 3D illustration of a cobalt-blue ceramic architectural lighthouse on a cool-white rocky island, pale calm sea and sculptural clouds, tactile matte surfaces, generous negative space; no people, text, logos, UI or neon.
- Retirement prompt: sophisticated architectural-model editorial illustration of a cobalt-blue lounge chair and striped parasol facing a calm sea from a cool-white terrace; tactile matte surfaces and soft daylight; no people, text, logos, clocks or UI.
- These are conceptual illustrations, not a person likeness or photographic evidence. Original generated PNGs remain in the local image-generation output directory.

## Verification Evidence

- pnpm update:lighthouse-news: passed, no content changes.
- Baseline browser: root rendered 8 source entries and working primary navigation.
- `pnpm -C apps/frontend-astro build`: passed, 16 pages. Existing Sentry missing-release/token, stale Browserslist and game-chunk-size warnings remain; no deployment configuration was changed.
- `pnpm exec vitest run apps/frontend-astro/src/lib/retirement.test.ts apps/frontend-astro/src/data/news.test.ts`: 7/7 passed, including second/day and terminal boundaries, progress clamping, leap-year/UTC+8 milestones, source contracts and RSS escaping/date semantics.
- Scoped TypeScript check and ESLint from the Astro app directory: passed. Running the type command from repo root initially failed to resolve Astro types; rerunning in the owning package resolved it without code changes.
- `xmllint --noout dist/rss.xml dist/sitemap.xml`: passed. Generated-HTML assertions: eight principal/detail pages each have one H1 and valid JSON-LD; all eight canonicals, shared Person identity and 179 local href/src targets passed. Temporary axe script was removed by the final build.
- Browser: 390px/1440px news and retirement, both themes; 320px/tablet overflow checks; profile/detail reading views. News category/search intersection, empty reset, reload/back/history restoration and no-JavaScript static content passed.
- Browser: countdown runs; copy has immediate success feedback; forced clipboard denial and failed selection-copy reveal a selectable canonical share text; focus enters/exits, Escape works and background inert/scroll state restores. Explicit theme persists across navigation. Virtual clipboard readback was unavailable, so success-path evidence is UI feedback; failure path text was inspected directly.
- axe-core 4.10.2: zero WCAG 2 A/AA and 2.1 AA violations on news, retirement, profile and a detail page; news and retirement checked in light and dark themes.
- Lighthouse 12.8.2 mobile, local production-layout build: retirement performance 98, accessibility 100, SEO 100; LCP 2.1s, CLS 0.003, TBT 20ms. These are local simulated mobile measurements, not field data or a search-ranking guarantee. Existing analytics and error monitoring were retained.
- Performance-audit raw JSON remains under the isolated worktree `.agents/artifacts/bo-editorial/2026-09-05/` as local evidence, not a source artifact for publication.
- Final news Lighthouse mobile: performance 97, accessibility 100, SEO 100; LCP 2.1s, CLS 0, TBT 20ms.
- Simulated document visibility change in the production build: seconds remain unchanged while hidden and recompute immediately on visibility restoration.
- Isolated `pnpm agent:lint`: passed with an L1 table-of-contents reminder. No L2 document was renamed or added, and existing AGENTS links remain correct. After surgical synchronization, original-workspace Astro build (16 pages), seven focused tests and `pnpm agent:lint` all passed.

## Handoff / Archive Notes

- Final state: completed locally; not pushed or deployed.
- Changes were synchronized into the original checkout with contextual patches. Existing package dependencies, richer documentation and unrelated game/mini-app changes were preserved; no original checkout files were staged or committed.
- Feature branch `codex/bo-editorial-redesign-20260905` is based on deployed `origin/main` a1fcb6f, so the redesign can be reviewed independently of the original dirty branch.
- Local review: `http://127.0.0.1:4322/` and `http://127.0.0.1:4322/retire/bo/`. The read-only production-layout preview remains available for handoff; the temporary dev server was stopped.
- Archive path: .agents/tasks/archive/2026-09-05-bo-editorial-redesign.md
