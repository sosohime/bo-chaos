# Task Record: miniapp retire runtime matrix

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue pushing the mini app UI toward a Tencent Cloud console style with truthful AI/tech product structure.

## Acceptance Boundaries

- Functional: Keep retirement countdown logic and shared constant sources unchanged.
- Verification: Run the WeChat mini app build, anti-slop source scan, agent lint, and git diff whitespace check.
- Docs Sync: No conventions or data model docs should need changes for page-level visual structure only.
- Safety: Do not change production API configuration, auth, runtime flags, or retirement constants.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and visual design skill guidance.
- Reviewed the retirement page and identified the first screen as accurate but still closer to a countdown page than a resource overview.
- Added a three-column runtime matrix to the retirement console header using only the target date, completed percent, and remaining percent from existing shared constants/countdown state.
- Simplified the progress panel copy so the percent values live in one clear place and the progress bar reads as a baseline state.

## Iteration Log

- N/A

## Deferred Verification

- WeChat DevTools visual verification is unavailable from this shell session; source and build evidence will be recorded.

## Decisions and Assumptions

- The runtime matrix should only use values derived from `@mono/const` retirement constants and the existing live countdown calculation.
- No new fake diagnostics, invented KPIs, or private cycle wording should be introduced.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-retire-runtime-matrix.md`
- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`

## Verification Evidence

- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|rgba\\(|box-shadow|gradient|glow|hero|15年|48|腾讯|退休规则|周期" apps/miniapp-taro/src/pages/retire -g '*.{tsx,scss,ts}'`: only matched `min-width: 48px`, a CSS dimension, not copy or retirement logic.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist/caniuse-lite age warnings.
- `git diff --check`: passed.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; no `docs/agent/CONVENTIONS.md` update is needed for this page-level visual structure change.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-runtime-matrix.md`
