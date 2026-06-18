# Task Record: miniapp kowtow console unify

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue the Tencent Cloud console-inspired mini app refactor by making the kowtow interaction page less stitched-together and more product-console credible.

## Acceptance Boundaries

- Functional: Kowtow page keeps existing stats fetch, local queue sync, review-mode behavior, image carousel, and tap action while the visible UI reads as a coherent status/resource/action console.
- Verification: Run the mini app WeChat build with the production API base URL, `git diff --check`, touched-file anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if conventions or architecture change; otherwise record why source-only visual polish does not need doc changes.
- Safety: No production browser writes, API target changes, auth changes, runtime config changes, or invented metrics.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app, visual design, and doc-sync skills.
- Read routing, conventions, quality, workflow docs.
- Inspected current retirement, kowtow, and photo browser UI source.
- Diagnosis: retirement and photo browser already use restrained console primitives; kowtow still has a stronger stitched-card feeling between status metrics, image resource, and action panel.
- Updated kowtow page resource copy to describe real current image, resource count, and local queue state.
- Unified the image resource panel and action panel with the same left status rail, quieter status chips, table-like resource metrics, and a more precise queue-write button.

## Iteration Log

- User feedback context: mini app should feel closer to Tencent Cloud product surfaces with restrained AI/tech energy, not official-site graphics or fake dashboards.

## Deferred Verification

- WeChat DevTools/device screenshot verification is still required for final broad UI acceptance but is not available in this shell pass.

## Decisions and Assumptions

- Keep all counts sourced from backend stats, local queue state, or static carousel resource count.
- Do not introduce generated image slices here because the page already has concrete image resources; additional decorative imagery would make it less product-like.

## Files Touched

- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-kowtow-console-unify.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully. Existing Browserslist staleness warning remains.
- `git diff --check`: passed.
- `rg -n "AI|智能|诊断|驾驶舱|洞察|官网|box-shadow|gradient|glow|hero|营销|山寨|点击查看动图|15年|48|✕|↓" apps/miniapp-taro/src/pages/kowtow -g '*.{tsx,scss,ts}'`: one benign match, `min-width: 48px` for a status chip width; no fake AI/marketing/retirement-rule copy.
- `pnpm agent:lint`: passed with warning `miniapp-doc-sync` because mini app source changed without `docs/agent/CONVENTIONS.md`; docs are unaffected because this is source-only visual polish and does not change conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-kowtow-console-unify.md`
