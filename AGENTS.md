# bo-chaos Agent Guide

This is the L1 entry point for AI coding agents. Keep it short. Load deeper docs from `docs/agent/` only when the task needs them.

## Behavior Rules

Use these rules before writing code:

- Think before coding. State assumptions, surface ambiguity, and ask only when repo context cannot resolve a high-impact decision.
- Simplicity first. Implement the smallest solution that satisfies the request. Do not add speculative flexibility.
- Surgical changes. Touch only files required by the task. Do not refactor adjacent code or clean up unrelated issues.
- Goal-driven execution. Convert tasks into verifiable outcomes, run the narrowest useful checks, and report evidence.

## Autonomy

Default to maximum autonomy for normal engineering work:

- Do code edits, docs edits, tests, builds, local dev servers, and browser debugging without pausing when the intent is clear.
- Do not ask for confirmation for low-risk local development actions listed in `docs/agent/COMMANDS.md`: repo `pnpm` commands, local read-only diagnostics, cleanup of dev servers started by the agent, local HTTP checks, and approved public-data refresh scripts.
- Stop before production deploys, pushes, PR creation, destructive data changes, real external writes, secrets handling, auth policy changes, or paid operations.
- If a task is ambiguous but low risk, choose the repo-local pattern and record the assumption.

## Context Loading

1. Start here.
2. Read `docs/agent/ROUTING.md` to locate the likely app/package.
3. Read only the relevant L2 docs:
   - Architecture: `docs/agent/ARCHITECTURE.md`
   - Commands: `docs/agent/COMMANDS.md`
   - Quality gates: `docs/agent/QUALITY.md`
   - Conventions: `docs/agent/CONVENTIONS.md`
   - Data model: `docs/agent/DATA_MODEL.md`
   - Frontend debug: `docs/agent/FRONTEND_DEBUG.md`
   - Workflow records: `docs/agent/WORKFLOW.md`
   - Skills: `docs/agent/SKILLS.md`
4. Read source files only after narrowing the target area.

## Repository Map

- `apps/backend-nest`: NestJS API for bofans features, auth, uploads, review, categories, kowtow stats.
- `apps/front-next-admin`: Next.js admin UI under base path `/rpg/admin`.
- `apps/miniapp-taro`: Taro WeChat mini app.
- `apps/frontend-astro`: Astro public pages.
- `apps/bo-retire-vsc-extension`: VS Code retirement countdown extension.
- `packages/prisma-client`: Prisma schema, generated client, migrations.
- `packages/const`, `packages/utils`, `packages/types`, `packages/ui`: shared libraries.

## Common Commands

- Install/update lockfile: `pnpm install --no-frozen-lockfile`
- Backend dev: `pnpm -C apps/backend-nest start:dev`
- Admin dev: `pnpm -C apps/front-next-admin dev`
- Astro dev: `pnpm -C apps/frontend-astro dev`
- Mini app dev: `pnpm -C apps/miniapp-taro dev:weapp`
- Package tests: `pnpm test`
- Backend tests: `pnpm -C apps/backend-nest test`
- Agent harness check: `pnpm agent:lint`

## Task Records

- For non-trivial work, create a task record from `.agents/templates/task-record.md` in `.agents/tasks/active/`.
- Use `Mode: full` by default; use `Mode: visual-fast-lane` only for repeated same-page visual micro-iterations.
- Record actions, decisions, verification evidence, and acceptance boundaries as work progresses.
- In Visual Fast Lane, batch CSS/layout feedback into one record and defer full build/lint until acceptance or scope change.
- Move completed, handed-off, or blocked records to `.agents/tasks/archive/` before the final response.

## Local Skills

Repo-local skills live in `.agents/skills/`:

- `bo-chaos-task-routing`
- `bo-chaos-backend`
- `bo-chaos-admin-frontend`
- `bo-chaos-miniapp`
- `bo-chaos-doc-sync`

Use them as playbooks when the request matches their descriptions.

## Hard Safety Rules

- Do not run browser actions that write to production `https://yuanbo.online/rpg/bofans`.
- Do not modify Prisma migrations or schema casually. If schema changes, update `docs/agent/DATA_MODEL.md`.
- Do not commit secrets, tokens, `.env` contents, or local private config.
- Do not change auth, CORS, upload security, deployment, or production API targets without explicit user approval.
- Run `pnpm agent:lint` before finishing any non-trivial code or docs change.
