# Task Record: miniapp my account summary

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Replace the My page account resource grid with a primary runtime summary plus compact metadata rows while preserving account values and nickname/avatar behavior.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change account API behavior, upload/history behavior, production API source targets, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed routing, conventions, quality, and current My page account markup/styles.
- Identified the account resource grid as a dashboard-like three-cell layout in the sticky first viewport.
- Replaced `account-resource-grid` / `account-resource-item` with `account-resource-summary`, a primary runtime summary, and compact metadata rows.
- Preserved avatar, nickname editing, role chip, runtime days, interaction count, and role value.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification.

## Decisions and Assumptions

- Screen job: My page gives account identity, upload entry, and upload history.
- Primary state: account runtime days.
- Source of truth: existing `accountRunDays`, `userInfo.kowtowCount`, and `accountRoleLabel`.
- Removal target: `account-resource-grid` makes account identity look like KPI cards.
- Closest Tencent Cloud pattern: account/resource summary with one primary value plus compact attributes.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-my-account-summary.md`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across My, approval, kowtow, retirement, shared photo browser, and custom tab bar source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-my-account-summary.md`
