# Task Record: Miniapp Kowtow Console Copy Polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud-style product console by reducing game-like wording and tightening status presentation on the kowtow page.

## Acceptance Boundaries

- Functional: Change only kowtow page presentation/copy; keep stats sync, local queue, batch submit, animation, image preview, runtime config, API targets, and review mode behavior unchanged.
- Verification: Build the WeChat mini app, run agent lint, and run whitespace checks.
- Docs Sync: No conventions update expected unless implementation changes a reusable engineering rule.
- Safety: Do not touch production config, secrets, deployment, backend APIs, or data shapes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and mini app visual design skills.
- Checked current branch/worktree state.
- Inspected the kowtow page TSX and SCSS.
- Renamed several panel labels toward operational product language while preserving the page domain.
- Styled the Bo resource carousel index as a compact status chip.
- Changed sync warning color to a restrained error state instead of reusing blue for every status.

## Iteration Log

- Design diagnosis: the page already uses white console panels, but phrases like "磕头状态台", "今日签到", and "今日操作" still read more like a game screen than a product-console interaction surface.
- Primary state/action: users need to see aggregate stats, local sync state, preview the Bo image node, and record one local interaction.
- Cheap/noisy elements to reduce: naked carousel index text and overly playful operational labels.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable from this execution context.

## Decisions and Assumptions

- Keep the domain concept in the tab/page, but make the panel labels more operational.
- Do not add fake AI metrics or diagnostics.

## Files Touched

- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-kowtow-console-copy-polish.md`

## Verification Evidence

- `pnpm exec prettier --write apps/miniapp-taro/src/pages/kowtow/index.tsx apps/miniapp-taro/src/pages/kowtow/index.scss .agents/tasks/active/2026-06-18-miniapp-kowtow-console-copy-polish.md`: passed.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro compiled successfully with existing Browserslist staleness and Node `punycode` warnings.
- `pnpm agent:lint`: passed with the expected miniapp-doc-sync warning. `docs/agent/CONVENTIONS.md` is unchanged because this turn only adjusts kowtow page presentation/copy, not mini app engineering conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-console-copy-polish.md`
