# Task Record: miniapp tabbar state polish

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by refining the custom tab bar active and inactive states.

## Acceptance Boundaries

- Functional: Refine tab bar visual states while preserving tab routing, runtime tab visibility, UGC hidden-tab behavior, active route detection, icon assets, and stable tab sizes.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers tab state rules or update docs if a durable new rule is introduced.
- Safety: Do not change app routes, production API target, runtime config semantics, UGC kill switch behavior, or tab labels.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected custom tab bar TSX, SCSS, and icon asset dimensions.
- Identified active icon shell styling as the remaining tab state that looked like a floating decorative pill.
- Removed the unused transparent divider structure from the custom tab bar.
- Rebalanced tab bar height, safe-area padding, icon shell, icon opacity, and active indicator placement.
- Removed the active icon shell background/border so active state is expressed by the top marker, icon asset, opacity, and label color without changing item size.
- Preserved route detection, runtime tab visibility, UGC hidden-tab behavior, labels, and icon assets.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: tab bar should provide stable global navigation with quiet inactive state and precise active state.
- Primary state: active tab should be visible without resizing, jumping, or becoming a floating card.
- Source of truth: current route, selected tab context, runtime tab config, and UGC enablement remain unchanged.
- Removal target: active icon shell and unused divider structure.
- Closest Tencent Cloud pattern: fixed product navigation rail/footer with top active marker.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-tabbar-state-polish.md`
- `apps/miniapp-taro/src/custom-tab-bar/index.tsx`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `git diff --check` passed.
- Anti-slop scan on custom tab bar TSX/SCSS found no banned marketing/AI/fake-count/old-retirement/decorative terms.
- `pnpm agent:lint` passed with `miniapp-doc-sync` warning; no docs update needed because `apps/miniapp-taro/DESIGN.md` already covers stable active/inactive tab state rules.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-state-polish.md`
