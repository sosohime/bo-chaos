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

## Task Modes

Choose the task mode before editing and record it in the task file as `Mode:`.

### Full Task

Use `full` by default. It applies to logic, data, API, scripts, config, package changes, cache behavior, cross-module changes, and any change that can affect runtime behavior.

Full Task requirements:

- keep the active task record updated through the work,
- run the relevant build/test/browser checks from `docs/agent/QUALITY.md`,
- run `pnpm agent:lint` before finishing,
- archive the completed, handed-off, or blocked record before the final response.

### Visual Fast Lane

Use `visual-fast-lane` only for repeated visual micro-iterations within the same page or component: spacing, alignment, color, font size, local copy, responsive classes, and frozen-area visual polish.

Visual Fast Lane rules:

- keep one active task record for the whole visual feedback batch,
- record each user feedback step in `Iteration Log`,
- during iteration, use Browser Use plus console inspection instead of running full build and `pnpm agent:lint` every time,
- record deferred checks in `Deferred Verification`,
- when the user says the result is acceptable, scope changes, or the turn ends, run the final relevant build plus `pnpm agent:lint`, then archive.

Exit Visual Fast Lane and upgrade to `full` when the change touches JavaScript logic, data fetching, routing, package/config files, cache policy, API behavior, state management, copy functionality, shared components, or multiple apps; also upgrade when runtime, build, or console errors appear.

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
- For Visual Fast Lane tasks, compress repeated CSS/layout feedback into the same record instead of creating one record per small adjustment.
- Treat task-record edits and archive notes as low-risk local documentation housekeeping; update them autonomously and keep moving.
- Do not record secrets, tokens, private env values, or sensitive local data.
- Do not archive a task as complete if verification was skipped without explanation.

## Completion States

- `complete`: implementation and acceptance checks are done.
- `handoff`: work is useful but needs user action, unavailable service, or external credential.
- `blocked`: cannot proceed without a missing decision or environment capability.

Archive all three states when the turn ends, but mark the state clearly at the top.
