# Task Record: miniapp photo command row

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the miniapp UI toward a Tencent Cloud product-console style by refining repeated photo card actions.

## Acceptance Boundaries

- Functional: Refine shared `PhotoItem` action controls into compact console-style commands while preserving save, vote, optimistic update, lazy image loading, and retry behavior.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers this component direction or update docs if a durable new rule is introduced.
- Safety: Do not change photo APIs, vote semantics, download behavior, image URL normalization, production API target, secrets, UGC behavior, or page routes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, project design memory, and doc-sync skills.
- Inspected shared `PhotoItem` and identified the save/vote action strip as a repeated control surface with button-like visual weight.
- Removed the custom CSS download glyph from the save action.
- Reworked the save action into a quieter `操作 / 保存` text command.
- Reduced the visual weight of save and vote controls while preserving the save handler, vote handler, optimistic update, count display, image lazy loading, and retry states.
- Fixed task-record filename collision with the previous archived `miniapp-photo-actions` task by renaming this task to `miniapp-photo-command-row`.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: photo cards should let users preview, save, and vote without turning each card into a promotional/action tile.
- Primary state: photo content and title/category remain primary; actions should be secondary and stable.
- Source of truth: vote count and vote state remain backend-backed through `PhotoDto` and reload after mutation.
- Removal target: custom decorative save glyph and strong action-button treatment.
- Closest Tencent Cloud pattern: compact table/resource-row commands with quiet borders and explicit text.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-photo-command-row.md`
- `apps/miniapp-taro/src/components/photoItem/index.scss`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro emitted existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- PhotoItem anti-slop scan for fake AI/marketing copy, hard-coded retirement labels, stale image/load copy, old color tokens, forbidden glow/gradient terms, and removed `photo-action-mark`/`photo-action-arrow`/`photo-action-tray` classes: no matches.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; `apps/miniapp-taro/DESIGN.md` already covers compact resource commands and no new convention was introduced.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-command-row.md`
