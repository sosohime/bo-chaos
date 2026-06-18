# Task Record: miniapp kowtow console panel

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving the mini app UI toward Tencent Cloud-style product surfaces with restrained AI/technology feel.

## Acceptance Boundaries

- Functional: make the kowtow page feel more like a product status panel using existing real data, without changing kowtow API behavior.
- Verification: mini app build and agent lint.
- Docs Sync: no API, data model, architecture, or convention changes; page structure and visual polish only.
- Safety: no production writes, no secrets, no endpoint changes.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Reworked the kowtow page from loose centered copy into a service-style status layout.
- Added a console header with real sync state and two stat cards for cumulative kowtow count and daily check-ins.
- Wrapped the carousel in a product panel with a lightweight node indicator.
- Converted the review-mode instructional copy into a structured service panel.
- Updated the shared swiper image type to match the actual `top`/`left` canvas metadata used by the page.
- Follow-up pass: audited the page against the tightened mini app visual skill and identified the image/interaction panel as the remaining mismatch.
- Follow-up pass: changed the media panel copy from loose display language to resource language, wrapped the swiper in one parent resource stage, and removed the swiper component's duplicate border/margin treatment.
- Follow-up pass: renamed the operation panel kicker from queue-centric copy to direct interaction copy while preserving local queue state text.

## Decisions and Assumptions

- The playful kowtow content remains, but it no longer dominates the whole page structure.
- No fake metrics were added; all numbers come from existing local count or backend stats.
- No generated imagery was introduced because the user rejected official-site/marketing image direction earlier.
- The existing images are kept as product personality, but the page frame now treats them as a controlled resource panel rather than a hero-like showcase.

## Files Touched

- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `apps/miniapp-taro/src/components/swiperImg/index.tsx`
- `apps/miniapp-taro/src/components/swiperImg/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-kowtow-console-panel.md`

## Verification Evidence

- `rg` scan for the old loose kowtow copy, old `磕着...` button copy, and stale swiper type fields: no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; conventions docs were not changed because this pass adjusts one page's visual structure only.
- Follow-up `rg` anti-slop scan over kowtow page and swiper component: no matches.
- Follow-up `git diff --check`: passed.
- Follow-up `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- Follow-up `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because this is source-only visual polish under existing conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-console-panel.md`
