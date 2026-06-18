# Task Record: miniapp tabbar console state

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud-style product console by refining the bottom tab active and inactive states.

## Acceptance Boundaries

- Functional: Preserve tab routes, runtime tab labels, UGC tab visibility, current-tab detection, icon asset paths, and `Taro.switchTab` behavior.
- Visual: Make active and inactive states stable, compact, and deliberate without marketing-pill styling, size jumps, glow, or mismatched icon rhythm.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if a durable new visual rule appears beyond existing `DESIGN.md` tab state guidance.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected custom tab bar TSX/SCSS, app tab config, and tab icon assets.
- Diagnosed the current short top indicator and opacity-only inactive icons as weaker than the desired product-console tab state.
- Refined tab bar styling to use a near-white console surface, stable icon shells, quieter inactive labels, and a restrained selected bottom accent.
- Preserved custom tab TSX, tab route list, runtime label lookup, UGC visibility filtering, and existing icon asset paths.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: provide stable global navigation and communicate current location.
- Primary state: one selected tab must be clear without turning into a decorative capsule.
- Source of truth: current route, app context selected tab, runtime tab labels, and UGC visibility remain unchanged.
- Removal target: hard top marker and opacity-only icon state that can feel pasted on.
- Closest Tencent Cloud pattern: compact console navigation item with thin selected accent and quiet icon container.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-tabbar-console-state.md`
- `apps/miniapp-taro/src/custom-tab-bar/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data warning.
- `git diff --check` passed.
- Focused anti-slop scan found only unrelated backend `@MaxLength(48)` validation.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; existing `apps/miniapp-taro/DESIGN.md` already covers stable tab active/inactive states, so no conventions doc change was needed.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-tabbar-console-state.md`
