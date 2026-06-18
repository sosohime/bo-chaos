# Task Record: miniapp approve tabs console

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue the mini app Tencent Cloud console visual refactor by flattening the approval page top tabs.

## Acceptance Boundaries

- Functional: Approval top tabs keep the same selected state, labels, counts, and tap behavior while active/inactive chrome matches the flatter console segmented style.
- Verification: Run the mini app WeChat build with the production API base URL, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if conventions change; otherwise record why source-only visual polish does not need docs.
- Safety: No API target, auth, runtime config, UGC switch, or approval data logic changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, and doc-sync skills.
- Read routing, conventions, quality, and workflow docs.
- Inspected approval page SCSS and top tab component SCSS.
- Diagnosis: approval page panels already use console primitives; approval top tabs still use an older floating bordered active cell.
- Updated approval top tabs to use a flat segmented container, stable 50px row height, top active rule, quieter inactive state, and a restrained count chip.

## Iteration Log

- User feedback context: app should move closer to Tencent Cloud product UI with restrained tech feel and avoid inconsistent tab active states.

## Deferred Verification

- WeChat DevTools/device screenshot verification remains required for final broad UI acceptance but is not available in this shell pass.

## Decisions and Assumptions

- Preserve the approval tab JSX and count source; this pass is visual polish only.
- Match the flatter selected-state direction already applied to the custom bottom tab bar and account upload-history tabs.

## Files Touched

- `apps/miniapp-taro/src/pages/approve/components/tabHead/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-approve-tabs-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully. Existing Browserslist staleness warning remains.
- `git diff --check`: passed.
- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|box-shadow|gradient|glow|hero|营销|山寨|点击查看动图|15年|48|✕|↓" apps/miniapp-taro/src/pages/approve/components/tabHead/index.scss -g '*.{tsx,scss,ts}'`: no matches.
- `pnpm agent:lint`: passed with warning `miniapp-doc-sync` because mini app source changed without `docs/agent/CONVENTIONS.md`; docs are unaffected because this is source-only visual polish and does not change conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-approve-tabs-console.md`
