# Task Record: miniapp tabbar console state

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue the Tencent Cloud console-inspired mini app visual refactor by fixing the bottom tab active/inactive treatment.

## Acceptance Boundaries

- Functional: Bottom tab bar keeps dynamic runtime visibility and UGC kill-switch behavior, while the selected/unselected states become more stable, restrained, and console-like.
- Verification: Run the mini app WeChat build with the production API base URL, `git diff --check`, anti-slop source scan, and `pnpm agent:lint`.
- Docs Sync: Agent docs updated only if conventions or workflow change; otherwise record why source-only visual polish does not require doc changes.
- Safety: No production browser writes, API target changes, auth changes, or runtime-config behavior changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, and doc-sync skills.
- Read routing, conventions, quality, workflow docs and current custom tab bar source.
- Confirmed current branch is clean before edits.
- Confirmed tab icon assets are present and consistently sized at 96x96, so this pass focuses on state chrome rather than replacing assets.
- Changed the custom tab bar SCSS to use a flatter console-style selected cell, top blue indicator, quieter inactive labels, and stable icon/text rhythm.

## Iteration Log

- User feedback context: current bottom tab active/inactive styles still feel wrong and the mini app should move closer to Tencent Cloud-style product UI with restrained AI/tech polish.

## Deferred Verification

- WeChat DevTools or device visual verification is still required for final acceptance but is not available inside this shell-only pass.

## Decisions and Assumptions

- Preserve tab filtering, tab labels, and selected-tab logic because those are runtime behavior and already support dynamic UGC visibility.
- Replace the active tab's bordered floating-control feel with a stable flat selected cell and top rule.

## Files Touched

- `apps/miniapp-taro/src/custom-tab-bar/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-tabbar-console-state.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully. Existing Browserslist staleness warning remains.
- `git diff --check`: passed.
- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|box-shadow|gradient|glow|hero|营销|山寨|点击查看动图|15年|48|✕|↓" apps/miniapp-taro/src/custom-tab-bar -g '*.{tsx,scss,ts}'`: no matches.
- `pnpm agent:lint`: passed with warning `miniapp-doc-sync` because mini app source changed without `docs/agent/CONVENTIONS.md`; docs are unaffected because this is source-only tab bar visual polish and does not change conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-console-state.md`
