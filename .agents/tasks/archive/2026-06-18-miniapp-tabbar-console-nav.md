# Task Record: miniapp tabbar console nav

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving the mini app UI toward a Tencent Cloud console style with more credible product navigation.

## Acceptance Boundaries

- Functional: Preserve existing tab visibility, UGC hiding, runtime tab text, and switchTab behavior.
- Verification: Run mini app WeChat build, anti-slop scan, agent lint, and git diff whitespace check.
- Docs Sync: No architecture, routing, data model, or conventions docs should need changes for CSS-only tabbar polish.
- Safety: Do not alter production API config, auth, runtime flags, or tab routes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Started from a clean `codex/miniapp-tech-refactor` branch synced to origin.
- Read mini app and visual design skill guidance.
- Reviewed custom tabbar markup and styles.
- Diagnosis: the tabbar behavior is correct, but the visual chrome still reads as repeated mini cards rather than a compact product navigation surface.
- Reworked the tabbar chrome into a quieter white console-nav surface with stable active sizing, subtle item separators, and a precise selected state.
- Implemented separators as real `CoverView` nodes instead of CSS pseudo-elements for better mini app cover-view compatibility.

## Iteration Log

- N/A

## Deferred Verification

- WeChat DevTools visual verification is unavailable from this shell session; source/build checks will be recorded.

## Decisions and Assumptions

- Keep current bitmap icon assets and improve the navigation chrome first; replacing icons needs visual review in DevTools or a real-device screenshot.
- Active state should be precise and stable, with no size jump, glow, or marketing pill styling.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-tabbar-console-nav.md`
- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`

## Verification Evidence

- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|rgba\\(|box-shadow|gradient|glow|hero|营销|山寨|pill|::before|::after" apps/miniapp-taro/src/custom-tab-bar -g '*.{tsx,scss,ts}'`: no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist/caniuse-lite age warnings.
- `git diff --check`: passed.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; no `docs/agent/CONVENTIONS.md` update is needed for this CSS/markup-only tabbar visual polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-console-nav.md`
