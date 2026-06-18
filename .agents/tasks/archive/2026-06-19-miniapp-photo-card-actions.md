# Task Record: miniapp photo card actions

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving repeated photo cards toward a Tencent Cloud product-console style with clearer actions.

## Acceptance Boundaries

- Functional: Refine photo card action presentation while preserving image lazy loading, preview, retry, download/save behavior, review-mode voting, optimistic vote state, and API calls.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers concrete action wording and compact photo cards or update docs if a durable new rule is introduced.
- Safety: Do not change media URL normalization, photo APIs, vote behavior, production API target, routes, or list pagination.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected `PhotoItem` TSX and SCSS.
- Identified the repeated "操作 / 保存" split label as vague action chrome on every photo card.
- Replaced the split "操作 / 保存" save action with one concrete "保存图片" action.
- Removed the unused save-action sublabel style and kept the compact action footprint stable.
- Preserved lazy image loading, preview, retry, download/save behavior, review-mode vote controls, optimistic vote state, and API calls.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: photo cards should show the image, identify it, and expose a clear save action without making the repeated action row noisy.
- Primary state: loaded/error image state and the concrete save/vote action.
- Source of truth: photo DTO, media URL normalization, local loading/error state, review runtime config, and vote count remain unchanged.
- Removal target: the vague `操作` label inside every save button.
- Closest Tencent Cloud pattern: compact resource card with concrete row action.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-photo-card-actions.md`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/components/photoItem/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `git diff --check` passed.
- Anti-slop scan on photo item TSX/SCSS found no banned marketing/AI/fake-count/old-retirement/decorative terms; the only `操作` hit is the existing failure toast `操作失败`, not the repeated card action label.
- `pnpm agent:lint` passed with `miniapp-doc-sync` warning; no docs update needed because `apps/miniapp-taro/DESIGN.md` already covers concrete action wording and compact photo cards.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-card-actions.md`
