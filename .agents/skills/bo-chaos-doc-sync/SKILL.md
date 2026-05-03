---
name: bo-chaos-doc-sync
description: Use after code, command, schema, routing, architecture, frontend debug, or workflow changes to keep bo-chaos agent docs synchronized and run the local harness lint.
---

# bo-chaos Doc Sync

Use this before finishing any non-trivial change.

## Workflow

1. Review changed files with `git diff --name-only HEAD --`.
2. Update or create the task record described in `docs/agent/WORKFLOW.md`.
3. Update the matching L2 docs:
   - Architecture or module boundary: `docs/agent/ARCHITECTURE.md`
   - Routing or ownership: `docs/agent/ROUTING.md`
   - Commands/scripts/ports: `docs/agent/COMMANDS.md`
   - Validation rules: `docs/agent/QUALITY.md`
   - Patterns/conventions: `docs/agent/CONVENTIONS.md`
   - Prisma/data contracts: `docs/agent/DATA_MODEL.md`
   - Browser/debug workflow: `docs/agent/FRONTEND_DEBUG.md`
   - Skills policy: `docs/agent/SKILLS.md`
   - Task lifecycle: `docs/agent/WORKFLOW.md`
4. Run `pnpm agent:lint`.
5. Treat warnings as prompts to either update docs or explain why docs are unaffected.
6. Archive completed, handed-off, or blocked task records under `.agents/tasks/archive/`.

## Verification

- `pnpm agent:lint` ran.
- Any warning has either a docs update or a clear reason in the final response.
- The task record has acceptance boundaries and an archive state.
