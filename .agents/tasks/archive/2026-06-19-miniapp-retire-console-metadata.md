# Task Record: miniapp retire console metadata

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Replace the retirement runtime metric grid with compact resource-detail metadata rows while preserving countdown constants, progress, and actions.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change shared retirement constants, production API source targets, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed routing, conventions, and quality docs.
- Inspected retirement and kowtow first-screen structures and styles.
- Replaced `retire-runtime-grid` / `retire-runtime-item` with compact `retire-runtime-list` / `retire-runtime-row` resource-detail rows.
- Preserved countdown constants, live remaining time, progress fill, copy action, and kowtow navigation.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification.

## Decisions and Assumptions

- Screen job: retirement page communicates the current countdown state and offers copy/interaction actions.
- Primary state: remaining days and live time.
- Source of truth: `@mono/const` retirement dates and locally computed countdown parts.
- Removal target: `retire-runtime-grid` looks like a dashboard metric block and is less Tencent Cloud console-like than a compact detail row list.
- Closest Tencent Cloud pattern: resource detail properties under a status header.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-retire-console-metadata.md`
- `apps/miniapp-taro/src/pages/retire/index.tsx`
- `apps/miniapp-taro/src/pages/retire/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across retirement, kowtow, shared photo browser, and custom tab bar source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-retire-console-metadata.md`
