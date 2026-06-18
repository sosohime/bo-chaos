# Task Record: Miniapp runtime state panels

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud console product surface with credible technical restraint.

## Acceptance Boundaries

- Functional: Birthday visibility and UGC kill-switch behavior remain unchanged. The shared state panels should read as operational states, not campaign cards or decorative notices.
- Verification: Run production-base mini app build, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Agent docs updated only if conventions change; otherwise record why docs are unaffected.
- Safety: No production writes, no API target changes, no secrets, no backend/data behavior changes.
- Archive: Move this record to `.agents/tasks/archive/` after checks pass.

## Actions

- Read mini app, visual design, doc sync, routing, conventions, quality, and workflow guidance.
- Inspected shared birthday event and UGC disabled components.
- Design diagnosis: these components communicate runtime state. The important state is whether a time/event/config gate is active. The cheap/inconsistent elements are campaign-like wording and older status chip borders. The closest Tencent Cloud pattern is a runtime configuration/status panel.
- Reworded the birthday panel from a campaign-like reminder to a runtime event panel.
- Aligned birthday and UGC disabled status chips to the current light console blue token.
- Made the birthday metadata grid read more like a structured status summary.

## Iteration Log

- Not using visual-fast-lane; this turn includes shared source changes plus final build/lint.

## Deferred Verification

- WeChat DevTools and real-device visual screenshots remain required for final broad UI acceptance but are not available in this local CLI pass.

## Decisions and Assumptions

- Keep this pass to copy and SCSS tokens so runtime conditions stay untouched.
- Do not add generated image slices; these state panels need clearer hierarchy, not more decoration.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-runtime-state-panels.md`
- `apps/miniapp-taro/src/components/boSheng/index.tsx`
- `apps/miniapp-taro/src/components/boSheng/index.scss`
- `apps/miniapp-taro/src/features/photos/ugc-disabled-state.scss`

## Verification Evidence

- `git diff --check`: passed.
- Anti-slop scan for fake intelligence copy, marketing words, glow/gradient/shadow, hard-coded retirement numbers, old animation prompt copy, stale birthday wording, and old border token: passed with no matches.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist data age warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this is source-only component polish within existing mini app visual rules.
- WeChat DevTools / real-device screenshots: not run in this local CLI pass; still needed for final broad UI acceptance.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-runtime-state-panels.md`
