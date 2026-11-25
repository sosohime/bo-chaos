# Task Record: Remove obsolete README content

- State: complete
- Mode: full
- Started: 2026-11-25
- Branch: codex/refresh-repo-readme
- Request: Remove outdated roadmap and release information from the README pages.

## Acceptance Boundaries

- Keep the root README focused on current apps and developer entry points.
- Keep historical deployment and troubleshooting evidence accessible through the immutable history link.
- Preserve current group-notebook setup, privacy boundaries, verification, and rollback instructions.
- Verify relative links and confirm the patch contains only documentation.

## Actions

- Removed the root app TODO backlog and linked to the full pet installation guide.
- Moved dated development build evidence out of the product README.
- Replaced the historical deployment narrative with an operational guide linked to earlier evidence.

## Verification Evidence

- Relative links resolve. The pinned historical document exists at the cited commit.
- `git diff --check` and `pnpm agent:lint` passed.
- Runtime and deployment configuration match main, so the task changes only documentation.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-25-readme-refresh.md`
