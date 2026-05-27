# Task Record: boshuo prompt whitespace followup

- State: complete
- Mode: full
- Started: 2026-05-27
- Branch: main
- Request: Remove remaining leading spaces in the own-agent prompt block and shorten the install prompt copy.

## Acceptance Boundaries

- Functional: The own-agent prompt no longer renders leading whitespace; the prompt no longer says `Codex 和 Claude Code 都装好`.
- Verification: Build Astro, inspect generated HTML text for zero leading whitespace and absent removed phrase, and run agent lint.
- Docs Sync: No L2 docs update expected because this is page markup/copy only; run agent lint.
- Safety: No production deploy or data writes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Confirmed Prettier reformatted the earlier inline `<pre><code>` markup back into whitespace-preserving text nodes.
- Shortened the own-agent prompt from `帮我安装博说 Skill，Codex 和 Claude Code 都装好。安装源是 ...` to `帮我安装博说 Skill。安装源是 ...`.
- Replaced code-block children with Astro `set:text` on `<pre>` elements so generated text is not affected by source indentation.

## Iteration Log

- Not using visual-fast-lane.

## Deferred Verification

- None.

## Decisions and Assumptions

- Keep the section title and manual command labels intact; only the agent prompt content is shortened per request.

## Files Touched

- `apps/frontend-astro/src/pages/bo/boge-skill.astro`
- `.agents/tasks/archive/2026-05-27-boshuo-prompt-whitespace-followup.md`

## Verification Evidence

- `pnpm run build:astro`: passed; Sentry auth-token warning only.
- Generated HTML inspection for `/bo/boge-skill/index.html`: own-agent prompt `leading=0`, `startsWithWhitespace=false`, `hasRemovedPhrase=false`.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-27-boshuo-prompt-whitespace-followup.md`
