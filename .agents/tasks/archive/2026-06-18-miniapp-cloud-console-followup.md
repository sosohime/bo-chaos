# Task Record: miniapp cloud console follow-up

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud product-console feel with AI/technology accents, avoiding official-site marketing imagery.

## Acceptance Boundaries

- Functional: remove remaining old dark/neon UI fragments from high-frequency mini app chrome and shared components.
- Verification: mini app build and agent lint.
- Docs Sync: no API, data model, architecture, or convention changes; this is visual polish.
- Safety: no production writes, no secrets, no runtime config changes.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Replaced the custom tab bar's visible PNG icons with unified console-style glyph blocks so the bottom navigation no longer depends on mismatched legacy icon art.
- Updated mini app navigation and tab bar config colors to the same light cloud-console palette used by the custom chrome.
- Reworked the birthday banner from a dark neon marquee into a light operational notice strip.
- Reworked the kowtow carousel container from dark card styling to a white/blue product panel.
- Replaced emoji/red canvas pulses in kowtow interactions with blue text pulses such as `BO`, `+1`, and `AI`.
- Removed dark upload preview and upload-history surfaces from the profile page.

## Decisions and Assumptions

- The existing `app.config.ts` tab icon paths remain present for WeChat configuration compatibility, but the custom tab bar no longer renders those PNGs.
- No generated bitmap or marketing hero asset was introduced after the user rejected the official-site direction.
- This pass keeps playful product copy where already present, but removes emoji-style decoration that conflicts with the cloud-console direction.

## Files Touched

- `apps/miniapp-taro/src/app.config.ts`
- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`
- `apps/miniapp-taro/src/components/boSheng/index.scss`
- `apps/miniapp-taro/src/components/swiperImg/index.scss`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-cloud-console-followup.md`

## Verification Evidence

- `rg` scan for old dark/neon tokens, emoji decoration, and rendered `CoverImage` tab icons in mini app source: no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; conventions docs were not changed because this pass only adjusts visual styling and app chrome, not mini app architecture or coding conventions.

## Handoff / Archive Notes

- Final state: complete after verification is added.
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-cloud-console-followup.md`
