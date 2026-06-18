# Task Record: miniapp ugc disabled state refine

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app UGC hidden state toward a clearer product-console style.

## Acceptance Boundaries

- Functional: Preserve the single UGC kill switch, hidden tab/page behavior, upload hiding, and runtime config override behavior.
- Verification: Build the WeChat mini app, run agent lint, and check whitespace diffs.
- Docs Sync: No architecture or command docs expected for presentation/copy polish.
- Safety: No production writes, no API target changes, no secrets.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Diagnosed shared and account-page UGC disabled states as still using config-ish copy rather than user-facing content state language.
- Updated the local visual-design skill with concrete external taste references and stricter BoChaos translation rules from current public AI UI skill patterns.
- Replaced the shared UGC disabled kicker with content-state language and aligned the account page hidden state with the same visual hierarchy.
- Updated the default UGC disabled fallback copy to avoid vague maintenance phrasing and state exactly which product areas are hidden.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- WeChat DevTools screenshot remains required for final visual acceptance if the tool window is available.

## Decisions and Assumptions

- Keep runtime overrides authoritative; only update default fallback copy and local labels.
- Use content visibility language that matches the single UGC kill switch.

## Files Touched

- apps/miniapp-taro/src/lib/runtime-config.ts
- apps/miniapp-taro/src/features/photos/UgcDisabledState.tsx
- apps/miniapp-taro/src/pages/my/index.tsx
- apps/miniapp-taro/src/pages/my/index.scss
- .agents/skills/bo-chaos-miniapp-visual-design/SKILL.md

## Verification Evidence

- `pnpm exec prettier --write .agents/skills/bo-chaos-miniapp-visual-design/SKILL.md apps/miniapp-taro/src/lib/runtime-config.ts apps/miniapp-taro/src/features/photos/UgcDisabledState.tsx apps/miniapp-taro/src/pages/my/index.tsx apps/miniapp-taro/src/pages/my/index.scss .agents/tasks/active/2026-06-18-miniapp-ugc-disabled-state-refine.md` passed; all files unchanged after formatting.
- `git diff --check` passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro/Webpack compiled successfully.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning because mini app source changed without `docs/agent/CONVENTIONS.md`; no conventions update is needed for this presentation/copy polish and skill guardrail update.
- Source scan confirmed old internal/fuzzy labels `运行配置` and `资料区正在整理` are absent from touched UGC hidden-state files.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-ugc-disabled-state-refine.md`
