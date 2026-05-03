# Task Record: agent workflow records

- State: complete
- Started: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Add action records, acceptance boundaries, and archive workflow to the agent harness.

## Acceptance Boundaries

- Functional: The harness defines where task records live, what they contain, and how active records become archived records.
- Verification: `pnpm agent:lint` and script syntax checks pass.
- Docs Sync: `AGENTS.md`, workflow docs, quality gates, commands, skills, and doc-sync skill all reference the lifecycle.
- Safety: No production, deployment, secret, or destructive action is involved.
- Archive: This record is stored under `.agents/tasks/archive/`.

## Actions

- Added `docs/agent/WORKFLOW.md` with the task lifecycle, acceptance boundaries, and archive states.
- Added `.agents/templates/task-record.md` as the reusable per-task record template.
- Added `.agents/tasks/active/` and `.agents/tasks/archive/` keep files.
- Updated `AGENTS.md` to include workflow records in context loading and task rules.
- Updated `docs/agent/QUALITY.md`, `COMMANDS.md`, and `SKILLS.md` to make records part of done criteria.
- Updated `.agents/skills/bo-chaos-doc-sync/SKILL.md` to require record updates and archive handling.
- Updated `scripts/agent-lint.mjs` to require the workflow doc, template, and task directories.

## Decisions and Assumptions

- Records are concise Markdown files, not chat transcripts.
- The archive directory can contain completed, handed-off, and blocked records as long as state is explicit.
- `.gitkeep` files keep the active/archive directories present without requiring active task records to be committed every time.

## Files Touched

- `AGENTS.md`
- `docs/agent/WORKFLOW.md`
- `docs/agent/QUALITY.md`
- `docs/agent/COMMANDS.md`
- `docs/agent/SKILLS.md`
- `.agents/templates/task-record.md`
- `.agents/tasks/active/.gitkeep`
- `.agents/tasks/archive/.gitkeep`
- `.agents/skills/bo-chaos-doc-sync/SKILL.md`
- `scripts/agent-lint.mjs`

## Verification Evidence

- `zsh -lc 'pnpm agent:lint'`: passed, output `agent-lint: ok`.
- `node --check scripts/agent-lint.mjs`: passed.
- `wc -l AGENTS.md docs/agent/WORKFLOW.md`: `AGENTS.md` is 82 lines, `WORKFLOW.md` is 58 lines.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-04-agent-workflow-records.md`
