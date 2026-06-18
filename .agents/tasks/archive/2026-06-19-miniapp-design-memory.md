# Task Record: miniapp design memory

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Convert current public AI UI taste-skill findings into repo-local miniapp design guidance.

## Acceptance Boundaries

- Functional: Add a miniapp design memory document and link it from the miniapp visual-design skill so future agents preserve the Tencent Cloud console direction.
- Verification: Run `pnpm agent:lint`, `git diff --check`, and scan the new guidance for banned fake AI/marketing language.
- Docs Sync: Update local skill guidance; update L2 docs only if the repo-wide skills policy changes.
- Safety: Do not change runtime code, production targets, secrets, auth, routes, or package dependencies.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed current miniapp visual skill and agent skills policy.
- Confirmed `apps/miniapp-taro` does not already have a `DESIGN.md`.
- Added `apps/miniapp-taro/DESIGN.md` as the miniapp visual contract for Tencent Cloud-style console fit, interaction rules, data honesty, page notes, and anti-slop rejection.
- Updated `.agents/skills/bo-chaos-miniapp-visual-design/SKILL.md` to require reading the project design memory before miniapp visual edits.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots are not needed for this docs-only change.

## Decisions and Assumptions

- External taste skills should be used as critique methods, not visual themes.
- A project-local `DESIGN.md` is the clearest home for concrete miniapp UI memory.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-design-memory.md`
- `.agents/skills/bo-chaos-miniapp-visual-design/SKILL.md`
- `apps/miniapp-taro/DESIGN.md`

## Verification Evidence

- `git diff --check`: passed.
- Guidance anti-slop scan: matched only negative/rejection examples in docs, not runtime UI copy.
- `pnpm agent:lint`: passed with no warnings.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-design-memory.md`
