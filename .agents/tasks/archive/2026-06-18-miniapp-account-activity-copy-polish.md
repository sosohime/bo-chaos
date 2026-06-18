# Task Record: Miniapp Account Activity Copy Polish

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue tightening My page account activity copy toward a Tencent Cloud console tone, then fold the reviewed UI taste skill principles into repo-local mini app visual guidance.

## Acceptance Boundaries

- Functional: Replace slang/social copy in My page daily stats and activity record with neutral activity/resource wording while preserving displayed values, user join-time calculation, and all account/upload behavior. Update repo-local visual guidance with product-interface and anti-generic-AI taste rules from reviewed public skills without installing external dependencies.
- Verification: Run mini app WeChat build and `pnpm agent:lint`.
- Docs Sync: Update agent skills documentation because local skill guidance changed; conventions, commands, routing, architecture, and data model remain unaffected.
- Safety: No API, production target, secret, data mutation, auth, upload, or runtime config behavior changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and visual-design skills.
- Audited My page daily card and activity record copy, finding slang/social wording in a now console-like page.
- Replaced My page daily stat labels and record copy with neutral activity/resource wording while preserving source values and join-time math.
- Added product-interface taste rules to the mini app visual-design skill and noted the third-party skill principles in `docs/agent/SKILLS.md`.

## Iteration Log

- Targeted My page copy only because the values are real and should be preserved.
- Treated public UI taste skills as critique inputs only; repo-local visual direction remains Tencent Cloud product-console inspired rather than a generic marketing theme.

## Deferred Verification

- WeChat DevTools visual verification may be unavailable in this terminal pass; record status before archive.

## Decisions and Assumptions

- Keep BoFans domain words where they are page/tab names, but use neutral metadata for stats and records.
- Product UI taste guidance should live in the existing mini app visual skill instead of adding new external skill dependencies.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-account-activity-copy-polish.md`
- `.agents/skills/bo-chaos-miniapp-visual-design/SKILL.md`
- `docs/agent/SKILLS.md`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed before the skill-doc update. Warnings: Node `punycode` deprecation and stale Browserslist/caniuse-lite data.
- `pnpm agent:lint` passed with the expected `miniapp-doc-sync` warning before the skill-doc update; rerun after final docs edits before archive.
- `git diff --check` passed before the skill-doc update; rerun after final docs edits before archive.
- `pnpm exec prettier --write apps/miniapp-taro/src/pages/my/index.tsx apps/miniapp-taro/src/pages/my/index.scss .agents/skills/bo-chaos-miniapp-visual-design/SKILL.md docs/agent/SKILLS.md .agents/tasks/active/2026-06-18-miniapp-account-activity-copy-polish.md` passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed after final edits. Warnings: Node `punycode` deprecation and stale Browserslist/caniuse-lite data.
- `pnpm agent:lint` passed after final edits with warnings:
  - `miniapp-doc-sync`: reviewed, `docs/agent/CONVENTIONS.md` does not need updates because no mini app convention changed.
  - `agents-toc-check`: reviewed, `AGENTS.md` does not need updates because no L2 docs were added, renamed, or removed.
- `git diff --check` passed after final edits.
- WeChat DevTools visual verification not run in this terminal pass.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-account-activity-copy-polish.md`
