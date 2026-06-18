# Task Record: miniapp photo item resource state

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving mini app UI toward Tencent Cloud console style by polishing high-frequency photo resource cards.

## Acceptance Boundaries

- Functional: Preserve photo lazy loading, preview, retry, download, vote, and optimistic vote behavior.
- Verification: Run mini app WeChat build, touched-file anti-slop scan, agent lint, and git diff whitespace check.
- Docs Sync: No architecture, commands, routing, data model, or conventions docs should need updates for component-only visual polish.
- Safety: Do not change production API config, auth, runtime flags, or API data shapes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Started from a clean `codex/miniapp-tech-refactor` branch synced to origin.
- Read mini app and visual design skill guidance.
- Reviewed the shared photo item component.
- Diagnosis: photo cards already preserve lazy loading and retry behavior, but the media state and save icon still feel like lightweight placeholder UI.
- Reworked loading and error states into a compact resource-state layout with a stable status mark and text block.
- Replaced the text download arrow with a CSS-drawn icon structure while preserving the existing save behavior.

## Iteration Log

- N/A

## Deferred Verification

- WeChat DevTools visual verification is unavailable from this shell session; source/build checks will be recorded.

## Decisions and Assumptions

- Keep the existing bitmap/photo content untouched and improve the UI states around it.
- Replace the character download marker with CSS-drawn structure to avoid a cheap glyph look.
- Do not add fake image diagnostics, dimensions, or load percentages.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-photo-item-resource-state.md`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/components/photoItem/index.scss`

## Verification Evidence

- `rg -n "lazyLoad|AI|智能|诊断|驾驶舱|洞察|官网|rgba\\(|box-shadow|gradient|glow|hero|营销|山寨|点击查看动图|15年|48" apps/miniapp-taro/src/components/photoItem -g '*.{tsx,scss,ts}'`: only matched `lazyLoad`, confirming lazy image loading remains and no anti-slop terms were introduced.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist/caniuse-lite age warnings.
- `git diff --check`: passed.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; no `docs/agent/CONVENTIONS.md` update is needed for this component-only visual polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-photo-item-resource-state.md`
