# Task Record: Miniapp Kowtow Feedback Polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Remove residual fake-tech interaction noise from the mini app kowtow page while keeping the Tencent Cloud console direction.

## Acceptance Boundaries

- Functional: Replace random fake AI/UP/OK click pulses and overly casual status copy with honest local increment/sync states while preserving kowtow counting, batching, stats polling, local storage, swiper, canvas animation, and review-mode behavior.
- Verification: Run mini app WeChat build and `pnpm agent:lint`.
- Docs Sync: Agent docs unaffected unless conventions, commands, routing, or architecture change.
- Safety: No API, production target, secret, data mutation, runtime config, or kowtow endpoint changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and visual-design skills.
- Audited residual fake-tech/low-taste text and found `AI`, `UP`, `OK` random pulse labels in the kowtow canvas interaction.
- Replaced random pulse labels with a single local increment acknowledgement `+1`, added a white stroke for legibility, and tightened sync/loading copy.
- Preserved kowtow counting, batching, polling, swiper, canvas placement, and review-mode branch behavior.

## Iteration Log

- Targeting kowtow interaction feedback because fake labels undermine the requested honest Tencent Cloud product-console tone.

## Deferred Verification

- WeChat DevTools visual verification may be unavailable in this terminal pass; record status before archive.

## Decisions and Assumptions

- Keep the canvas animation and counting behavior, but make the visible pulse a direct local increment acknowledgement.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-kowtow-feedback-polish.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`

## Verification Evidence

- `pnpm exec prettier --write apps/miniapp-taro/src/pages/kowtow/index.tsx .agents/tasks/active/2026-06-18-miniapp-kowtow-feedback-polish.md`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed. Warnings only: stale Browserslist data and Node `punycode` deprecation.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; no conventions changed, so docs update is not needed.
- `git diff --check`: passed.
- `rg -n "\b(AI|UP|OK)\b|pulseLabels|提交中\.\.\.|同步有点慢" apps/miniapp-taro/src/pages/kowtow/index.tsx apps/miniapp-taro/src/pages/kowtow/index.scss`: no matches.
- WeChat DevTools visual verification was not available in this terminal pass.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-feedback-polish.md`
