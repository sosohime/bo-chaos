# Task Record: miniapp remove AI glow

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving mini app UI taste toward Tencent Cloud-style product UI and away from generic AI/template visuals.

## Acceptance Boundaries

- Functional: remove generic AI-style radial glow backgrounds from primary mini app page shells.
- Verification: mini app build and agent lint.
- Docs Sync: no API, data model, architecture, or convention changes; visual shell polish only.
- Safety: no production writes, no secrets, no endpoint changes.
- Archive: store this completed record under `.agents/tasks/archive/`.

## Actions

- Removed radial glow backgrounds from global tech pages and the retirement, profile, kowtow, approval, and gallery page shells.
- Replaced those backgrounds with restrained light gray-blue console workspace backgrounds.
- Removed decorative gradients from the birthday notice, daily card, and gallery category header where they read as template decoration.
- Kept image-loading placeholder gradients and upload success tint because those communicate local state rather than global decoration.

## Decisions and Assumptions

- Tencent Cloud style is interpreted here as product-console restraint: quiet workspace background, white panels, thin borders, and limited accent use.
- No generated image assets were added because prior marketing-style image attempts were rejected.

## Files Touched

- `apps/miniapp-taro/src/app.scss`
- `apps/miniapp-taro/src/components/boSheng/index.scss`
- `apps/miniapp-taro/src/features/photos/photo-browser.scss`
- `apps/miniapp-taro/src/pages/approve/index.scss`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `apps/miniapp-taro/src/pages/retire/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-remove-ai-glow.md`

## Verification Evidence

- `rg` scan for `radial-gradient`, CTA blue gradients, `#00a4ff`, `font-weight: 900`, and casual list footer copy: no matches in mini app source.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; conventions docs were not changed because this pass is visual shell polish only.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-remove-ai-glow.md`
