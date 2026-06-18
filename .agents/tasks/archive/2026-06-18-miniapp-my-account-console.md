# Task Record: miniapp my account console

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward Tencent Cloud product-console quality by tightening the My page account surface.

## Acceptance Boundaries

- Functional: My page should avoid duplicate account summary cards and use consistent restrained status chips, while preserving user info, avatar edit, nickname edit, Bo daily card, upload, history, UGC switch, and refresh behavior.
- Verification: Run mini app WeApp build with production API base, `git diff --check`, anti-slop scan on touched files, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if no L2 doc changes are needed.
- Safety: Do not change account fetch/update APIs, upload/history behavior, UGC kill switch, or production API target.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Design Diagnosis

- Screen job: Show current account resource state, daily Bo status, and entry points to upload/history workflows.
- Primary state: account role, run days, interaction count, and current daily resource card.
- Cheap/noisy element: the activity record card repeats run days and interaction count already shown in the sticky account resource grid.
- Source of truth: user profile DTO and Bo daily card response.
- Tencent Cloud reference pattern: compact account resource header plus one daily resource panel, then task sections.
- Tech allowance: precise resource labels and status chips only; no invented diagnostics or decorative image slice.

## Actions

- Read mini app and visual design skills plus relevant agent docs.
- Inspected My page account header, daily card, and activity record sections.
- Removed the duplicate activity record card because its run-day and interaction facts are already shown in the account resource grid.
- Harmonized account and Bo daily status chips with the current console-style background and border treatment.

## Decisions and Assumptions

- Removing the duplicate activity record is visual information-architecture cleanup; the same data remains visible in the account resource grid.

## Files Touched

- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-my-account-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed. Taro compiled successfully; Browserslist data warning is pre-existing/toolchain-related.
- `git diff --check` passed.
- Anti-slop scan on touched files passed with only the existing avatar `48px` matches.
- `pnpm agent:lint` passed with expected `miniapp-doc-sync` warning; L2 docs are unaffected because this is source-only visual polish and does not change conventions.
- WeChat DevTools or real-device visual inspection was not run in this turn, so broad final UI acceptance remains unverified.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-my-account-console.md`
