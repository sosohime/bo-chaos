# Task Record: miniapp global card primitive

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app UI toward Tencent Cloud-style product-console surfaces with restrained AI/tech feeling.

## Acceptance Boundaries

- Functional: Preserve global page classes and avoid changing runtime behavior.
- Visual: Align the remaining global `.tech-card` primitive with the compact 6px console surface language.
- Verification: Run miniapp build, `git diff --check`, focused anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update docs only if this introduces a durable rule beyond `apps/miniapp-taro/DESIGN.md`.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Ran a broad miniapp visual debt scan for large radii, gradients, shadows, marketing/hero classes, and fake AI/tech copy.
- Identified the global `.tech-card` 8px radius as the only remaining broad visual primitive mismatch.
- Aligned `.tech-card` to the shared 6px compact console panel style and added explicit `box-sizing`.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable in this turn; acceptance relies on source inspection, build output, and scans.

## Decisions and Assumptions

- Screen job: keep global primitives aligned with the product-console visual system for future reuse.
- Primary state: `.tech-card` should not reintroduce rounded decorative-card styling.
- Source of truth: project design memory and current cross-page 6px panel convention.
- Removal target: leftover 8px card radius in global app styles.
- Closest Tencent Cloud pattern: compact bordered resource panel.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-global-card-primitive.md`
- `apps/miniapp-taro/src/app.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed with existing Browserslist stale-data and punycode deprecation warnings.
- `git diff --check` passed.
- Broad miniapp visual debt scan passed with no matches for large radii, shadows, gradients, marketing/hero classes, fake AI/tech copy, hard-coded retirement copy, or lazy-load anti-pattern labels.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning. No `docs/agent/CONVENTIONS.md` update needed because `apps/miniapp-taro/DESIGN.md` already covers compact console surfaces and avoiding decorative cards.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-global-card-primitive.md`
