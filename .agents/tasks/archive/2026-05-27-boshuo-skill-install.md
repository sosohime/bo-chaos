# Task Record: boshuo skill install and page whitespace

- State: complete
- Mode: full
- Started: 2026-05-27
- Branch: HEAD
- Request: Install the boshuo Skill for Codex and Claude Code, and diagnose/fix leading spaces in the public install prompt.

## Acceptance Boundaries

- Functional: `boshuo` skill is present under user-level Codex and Claude Code skill directories.
- Verification: Confirm installed files exist and have the expected `name: boshuo` frontmatter; verify Astro prompt text no longer renders leading indentation.
- Docs Sync: Run agent harness lint before finishing; update docs only if the change affects agent guidance.
- Safety: Do not deploy production or perform destructive cleanup outside the requested local skill install.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Routed the page issue to `apps/frontend-astro/src/pages/bo/boge-skill.astro`.
- Identified that `<pre>` indentation was preserved as visible whitespace before nested `<code>` content.
- Installed `boshuo` from the GitHub-backed installer into `/Users/heyesheng/.codex/skills/boshuo` and `/Users/heyesheng/.claude/skills/boshuo`.
- Changed prompt and command `<pre>` blocks so the nested `<code>` starts immediately after the opening `<pre>`.

## Iteration Log

- Not using visual-fast-lane.

## Deferred Verification

- None.

## Decisions and Assumptions

- Treat the GitHub-backed installer in `packages/agent-skills/install-boshuo.sh` as the requested install path because it pulls from the specified raw GitHub source.

## Files Touched

- `apps/frontend-astro/src/pages/bo/boge-skill.astro`
- `.agents/tasks/archive/2026-05-27-boshuo-skill-install.md`

## Verification Evidence

- `bash packages/agent-skills/install-boshuo.sh`: installed Codex and Claude Code copies after sandbox DNS blocked the first attempt and the command was rerun with network approval.
- `sed -n '1,8p' /Users/heyesheng/.codex/skills/boshuo/SKILL.md`: confirmed `name: boshuo`.
- `sed -n '1,8p' /Users/heyesheng/.claude/skills/boshuo/SKILL.md`: confirmed `name: boshuo`.
- `pnpm run build:astro`: passed; Sentry auth-token warning only.
- Static HTML check for `apps/frontend-astro/dist/bo/boge-skill/index.html`: target prompt `startsWithWhitespace=false`, `leading=0`.
- Playwright browser check: blocked because local Playwright browser executable is not installed.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-27-boshuo-skill-install.md`
