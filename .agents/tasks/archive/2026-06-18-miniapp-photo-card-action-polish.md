# Task Record: miniapp photo card action polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue pushing the mini app UI toward Tencent Cloud console style with restrained technology feel.

## Acceptance Boundaries

- Functional: Preserve image lazy loading, preview, retry, save-to-album, vote/cancel-vote, and review-mode visibility.
- Verification: Run mini app WeChat build, agent lint, anti-slop scan, and diff whitespace checks.
- Docs Sync: Note whether conventions need updates.
- Safety: Do not change API targets, auth, secrets, schema, or production behavior.
- Archive: Move completed record to `.agents/tasks/archive/`.

## Actions

- Read mini app and visual design skills.
- Audited `PhotoItem`, the shared card used by photo feeds.
- Identified the card action row as remaining text-pill UI that feels less like a product resource row.
- Reworked the action row into a resource operation layout with a primary save action and a separate vote status group.
- Kept image lazy loading, preview, retry, save, and vote logic unchanged.

## Iteration Log

- Design diagnosis: photo card job is browsing a media resource and exposing a small set of actions without disrupting scanning.
- Removal target: generic small text pills in the action row.

## Deferred Verification

- WeChat DevTools screenshot capture remains unavailable from prior audits; rely on build, lint, source inspection, and scans as partial evidence.

## Decisions and Assumptions

- Keep text labels for clarity, but structure actions as a resource operation row with stable action/status groups.

## Files Touched

- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/components/photoItem/index.scss`
- `.agents/tasks/archive/2026-06-18-miniapp-photo-card-action-polish.md`

## Verification Evidence

- Anti-slop scan over photo card and mini app surfaces: only accepted `box-shadow: none` residual remains.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because this is source-only visual polish under existing conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-photo-card-action-polish.md`
