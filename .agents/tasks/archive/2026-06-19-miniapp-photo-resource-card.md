# Task Record: miniapp photo resource card

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue improving the mini app toward a Tencent Cloud-style product console with restrained tech feeling.

## Acceptance Boundaries

- Functional: Refine photo cards into clearer resource items with truthful metadata and stable action controls while preserving lazy image loading and preview/save/vote behavior.
- Verification: Run the miniapp WeChat build, focused anti-slop scan, `git diff --check`, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if agent docs are unaffected.
- Safety: Do not touch production, API base URLs, secrets, schema, auth, or backend behavior.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record.
- Refactored `PhotoItem` metadata from a plain subtitle into a resource metadata row with category and real photo ID.
- Renamed the card action label from a generic command label to a quieter action rail label and tightened the action group styling.
- Preserved image `lazyLoad`, preview, save, vote, retry, and API refresh behavior.

## Iteration Log

- User direction remains Tencent Cloud console fit plus credible AI/tech feeling without fake dashboards or decorative effects.

## Deferred Verification

- WeChat DevTools / real-device visual verification remains required for final visual acceptance if available.

## Decisions and Assumptions

- Screen job: browse real photos and take concrete actions such as preview, save, and vote when available.
- Primary state/action: image content, resource name/category/id, and available action controls.
- Data source: title/category/id/votes come from `PhotoDto`; no derived fake metrics.
- Removal target: generic content-card action row that reads less like a product resource item.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-photo-resource-card.md`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/components/photoItem/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist stale-data and Node punycode deprecation warnings.
- Focused anti-slop scan: passed; only unrelated backend `apps/backend-nest/src/bofans/users/users.controller.ts:36 @MaxLength(48)` matched.
- `git diff --check`: passed.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because miniapp source changed without `docs/agent/CONVENTIONS.md`; no conventions update needed for this local component visual/interaction polish.
- WeChat DevTools / real-device visual verification: not run in this turn.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-resource-card.md`
