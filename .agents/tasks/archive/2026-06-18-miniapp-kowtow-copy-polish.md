# Task Record: Miniapp Kowtow Copy Polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue tightening mini app UI tone toward Tencent Cloud console style by removing casual kowtow status copy.

## Acceptance Boundaries

- Functional: Replace overly casual kowtow action-panel status copy with neutral product-state language while preserving stats, queue, sync, button, animation, local storage, polling, and review-mode behavior.
- Verification: Run mini app WeChat build and `pnpm agent:lint`.
- Docs Sync: Agent docs unaffected unless conventions, commands, routing, or architecture change.
- Safety: No API, production target, secret, data mutation, runtime config, or kowtow endpoint changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and visual-design skills.
- Scanned mini app source for residual fake-tech, marketing, and low-taste copy.
- Found kowtow action-panel copy still used casual encouragement text.
- Replaced casual daily-state copy with neutral local operation/sync state text.

## Iteration Log

- Targeting copy tone because the visual system is now mostly console-like, and casual status text is a remaining mismatch.

## Deferred Verification

- WeChat DevTools visual verification may be unavailable in this terminal pass; record status before archive.

## Decisions and Assumptions

- Use neutral, truthful daily state wording without inventing diagnostics or metrics.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-kowtow-copy-polish.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`

## Verification Evidence

- `pnpm exec prettier --write apps/miniapp-taro/src/pages/kowtow/index.tsx .agents/tasks/active/2026-06-18-miniapp-kowtow-copy-polish.md`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed. Warnings only: stale Browserslist data and Node `punycode` deprecation.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no conventions changed, so docs update is not needed.
- `git diff --check`: passed.
- `rg -n "博哥对你很满意|抓紧|有点慢|提交中\.\.\." apps/miniapp-taro/src/pages/kowtow/index.tsx apps/miniapp-taro/src/pages/kowtow/index.scss`: no matches.
- WeChat DevTools visual verification was not available in this terminal pass.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-copy-polish.md`
