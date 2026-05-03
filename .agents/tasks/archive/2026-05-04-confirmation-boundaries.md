# Task Record: Confirmation boundaries

- State: archived
- Started: 2026-05-04
- Completed: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Document that local development commands, local diagnostics, self-started dev server cleanup, local HTTP checks, and known safe public-data refreshes should not trigger repeated user confirmations.

## Acceptance Boundaries

- Functional: Agent docs clearly mark the five discussed command/action categories as autonomous, low-risk work.
- Verification: Run `pnpm agent:lint`.
- Docs Sync: Update L1 and matching L2 docs.
- Safety: Preserve high-risk confirmation boundaries for production writes, destructive actions, secrets, deploys, pushes, and real external writes.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Added L1 autonomy guidance pointing agents to command safety boundaries.
- Added a no-confirmation local actions section covering repo `pnpm` commands, local diagnostics, cleanup of agent-started dev servers, local HTTP/browser checks, and the safe Lighthouse public-data refresh.
- Preserved must-confirm boundaries for production writes, destructive actions, secrets, deploys, pushes, security policy changes, paid operations, and real external writes.
- Updated frontend debug workflow to treat local dev server and browser checks as autonomous verification work.
- Updated workflow records guidance to record low-risk autonomous actions as evidence instead of asking the user.
- Archived this record after verification.

## Decisions and Assumptions

- This is a harness documentation update only; no runtime code change is needed.
- `kill <pid>` remains allowed only for a verified agent-started dev server, not arbitrary local processes.
- Public-data refresh autonomy is narrow and currently only covers `pnpm update:lighthouse-news`.

## Files Touched

- `AGENTS.md`
- `docs/agent/COMMANDS.md`
- `docs/agent/FRONTEND_DEBUG.md`
- `docs/agent/WORKFLOW.md`
- `.agents/tasks/archive/2026-05-04-confirmation-boundaries.md`

## Verification Evidence

- `pnpm agent:lint`: passed with `agent-lint: ok`.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-05-04-confirmation-boundaries.md`
