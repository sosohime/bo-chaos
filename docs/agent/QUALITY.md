# Agent Quality Gates

Use this file to choose checks for a change. Prefer narrow checks that prove the touched behavior, then broaden when risk increases.

## Always

- Read the target files before editing.
- Match the local style and existing abstractions.
- Update `docs/agent/*` when changing architecture, commands, routing, data models, or safety rules.
- Maintain a task record for non-trivial work using `docs/agent/WORKFLOW.md`.
- Run `pnpm agent:lint` before finishing non-trivial work.
- Report what changed, what ran, and what remains unverified.

## Change Type Matrix

| Change type                | Minimum checks                                                 | Extra checks when risky                                                 |
| -------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Agent docs or skills       | `pnpm agent:lint`                                              | inspect rendered Markdown if formatting is complex                      |
| Shared utils               | `pnpm -C packages/utils test`                                  | `pnpm -C packages/utils build`                                          |
| Shared constants           | inspect all consumers with `rg`                                | `pnpm build`                                                            |
| Backend controller/service | `pnpm -C apps/backend-nest test`                               | `pnpm -C apps/backend-nest test:e2e`, `pnpm -C apps/backend-nest build` |
| Prisma schema              | update `DATA_MODEL.md`, `pnpm -C packages/prisma-client build` | migration review, backend tests                                         |
| Admin UI                   | `pnpm -C apps/front-next-admin build` when feasible            | Browser Use / Playwright local verification                             |
| Taro mini app              | `pnpm -C apps/miniapp-taro build:weapp` when feasible          | manual WeChat devtools verification noted as not run                    |
| Astro UI                   | `pnpm -C apps/frontend-astro build`                            | browser verification                                                    |
| Visual Fast Lane UI polish | during iteration: Browser Use plus console inspection          | final acceptance: relevant build plus `pnpm agent:lint`                 |
| VS Code extension          | `pnpm -C apps/bo-retire-vsc-extension compile`                 | extension tests if environment supports them                            |

Visual Fast Lane is only for visual micro-iterations in one page or component. Do not use it for behavior, data, routing, scripts, dependencies, package/config files, cache policy, copy-to-clipboard behavior, shared components, or deployment-related changes.

## Browser Verification

Use browser verification when:

- A user-facing admin or Astro UI changed.
- A route, base path, rewrite, auth redirect, dialog, form, table, or loading state changed.
- A bug only appears at runtime.

For admin, avoid write actions against production data because local `/api` rewrites to production.

## Definition of Done

Before final response:

- Active task record captures actions, acceptance boundaries, and verification evidence.
- Visual Fast Lane tasks capture intermediate browser checks and deferred final verification in one record.
- Relevant docs/skills are updated or explicitly unaffected.
- `pnpm agent:lint` ran or the reason it could not run is stated.
- Relevant tests/builds/browser checks ran or are listed as not run.
- Any high-risk autonomous action was avoided or explicitly approved.
- Completed, handed-off, or blocked task record is archived under `.agents/tasks/archive/`.
