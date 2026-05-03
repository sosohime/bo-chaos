# Agent Workflow Records

This file defines the task lifecycle for AI agents working in this repo.

## Why This Exists

Agents must not leave important work only in chat history. Every non-trivial task needs:

- an action record,
- explicit acceptance boundaries,
- verification evidence,
- an archive step when the task is complete.

## Task Record Lifecycle

1. Start a record from `.agents/templates/task-record.md`.
2. Save the active record under `.agents/tasks/active/`.
3. Keep it updated while working:
   - decisions and assumptions,
   - files touched,
   - commands run,
   - browser URLs/screenshots observed,
   - blockers and user confirmations,
   - acceptance checklist status.
4. Before final response, update the acceptance checklist.
5. When accepted or handed off as complete, move the record to `.agents/tasks/archive/`.

Use one file per task. Suggested name:

`YYYY-MM-DD-short-task-name.md`

## Acceptance Boundaries

Every task record must state what counts as done before execution starts or as soon as the target is clear.

Minimum acceptance sections:

- **Functional**: user-visible behavior or code outcome.
- **Verification**: exact commands, builds, tests, browser checks, or why they cannot run.
- **Docs Sync**: agent docs updated or explicitly unaffected.
- **Safety**: high-risk actions avoided or explicitly approved.
- **Archive**: active record moved to archive when complete.

## Action Record Rules

- Record facts, not stream-of-consciousness.
- Prefer concise bullets with timestamps only when timing matters.
- Include failed attempts if they affect diagnosis or future workflow.
- Record low-risk autonomous local actions as evidence; do not turn them into user confirmations.
- Treat task-record edits and archive notes as low-risk local documentation housekeeping; update them autonomously and keep moving.
- Do not record secrets, tokens, private env values, or sensitive local data.
- Do not archive a task as complete if verification was skipped without explanation.

## Completion States

- `complete`: implementation and acceptance checks are done.
- `handoff`: work is useful but needs user action, unavailable service, or external credential.
- `blocked`: cannot proceed without a missing decision or environment capability.

Archive all three states when the turn ends, but mark the state clearly at the top.
