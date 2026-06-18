# Task Record: miniapp bosheng event panel

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue polishing the mini app toward a Tencent Cloud console style with restrained AI/tech product UI.

## Acceptance Boundaries

- Functional: Keep the existing birthday visibility logic unchanged.
- Verification: Run mini app WeChat build, agent lint, and git diff whitespace check.
- Docs Sync: No architecture, command, routing, or data model docs should need changes for this source-only visual polish.
- Safety: Do not change production API target, runtime config, auth, or data fetch behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Started from a clean `codex/miniapp-tech-refactor` worktree.
- Read mini app and visual design skill guidance before editing.
- Identified `BoSheng` as a shared component that still reads like a simple legacy card rather than a product-console event state.
- Reworked the birthday reminder into a compact event panel with a main status row and a three-column factual meta strip.
- Kept birthday visibility logic unchanged and avoided decorative AI/marketing language.

## Iteration Log

- N/A

## Deferred Verification

- WeChat DevTools visual verification is not available in this shell session; source/build verification will be recorded.

## Decisions and Assumptions

- Birthday event labels can be factual static labels because the component already renders only on the birthday condition.
- Avoid fake counters, decorative AI claims, gradients, glows, and marketing hero language.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-bosheng-event-panel.md`
- `apps/miniapp-taro/src/components/boSheng/index.tsx`
- `apps/miniapp-taro/src/components/boSheng/index.scss`

## Verification Evidence

- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|rgba\\(|box-shadow|gradient|glow|hero" apps/miniapp-taro/src/components/boSheng -g '*.{tsx,scss}'`: no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; only existing Browserslist/caniuse-lite age warnings.
- `pnpm agent:lint`: passed with `miniapp-doc-sync` warning; reviewed and no conventions update is needed for this source-only visual component polish.
- `git diff --check`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-bosheng-event-panel.md`
