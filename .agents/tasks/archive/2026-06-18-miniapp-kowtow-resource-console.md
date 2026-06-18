# Task Record: miniapp kowtow resource console

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward Tencent Cloud console taste by refining the kowtow interaction resource panel.

## Acceptance Boundaries

- Functional: Preserve kowtow tap behavior, canvas feedback, swiper image switching, stat syncing, share config, and in-review fallback.
- Verification: Run mini app WeChat build, touched-file anti-slop scan, git diff whitespace check, and agent lint.
- Docs Sync: No L2 docs update unless this introduces a new shared convention or behavior contract.
- Safety: Do not change production API config, auth, runtime flags, kowtow API behavior, or sync timing.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, doc-sync, routing, conventions, quality, and workflow guidance.
- Reviewed kowtow page TSX/SCSS and the shared swiper component.
- Diagnosis: the interaction resource card has functional image switching, but it lacks console-style resource context and reads more like a plain framed media card.
- Added a compact resource matrix to the kowtow image card using only current swiper index, total resource count, and local sync queue state.
- Refined the resource card spacing so the swiper reads as part of a console resource detail panel.
- Preserved kowtow tap behavior, canvas feedback, swiper switching, stat syncing, share config, and in-review fallback.

## Iteration Log

- N/A

## Deferred Verification

- WeChat DevTools visual verification is unavailable from this shell session; source/build checks will be recorded.

## Decisions and Assumptions

- Use only real local state for the resource matrix: current image index, total image count, and local sync queue status.
- Keep the change scoped to `pages/kowtow`; no shared swiper or API changes are needed.
- No L2 docs update is needed because this is local visual polish, not a new behavior contract.

## Files Touched

- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-kowtow-resource-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed. Existing Browserslist/caniuse-lite age warnings only.
- Touched-file anti-slop scan only matched an existing `min-width: 48px` layout value, not forbidden copy or fake metrics.
- Diff-only anti-slop scan returned no matches.
- `git diff --check` passed.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning; no docs update needed for local visual polish.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-resource-console.md`
