# Agent Commands

Use exact commands from this file when validating changes.

## Workspace

- Package manager: `pnpm@9.15.4`
- Root package scripts are in `package.json`.
- Workspace definition: `pnpm-workspace.yaml`
- Nx config: `nx.json`

## Root Commands

| Task                            | Command                             |
| ------------------------------- | ----------------------------------- |
| Install/update lockfile         | `pnpm install --no-frozen-lockfile` |
| Build shared packages           | `pnpm build`                        |
| Test shared packages            | `pnpm test`                         |
| Build Astro                     | `pnpm build:astro`                  |
| Start backend                   | `pnpm start:nest`                   |
| Start admin                     | `pnpm start:admin`                  |
| Start Astro                     | `pnpm start:astro`                  |
| Start mini app                  | `pnpm start:weapp`                  |
| Agent harness lint              | `pnpm agent:lint`                   |
| Reckful visual acceptance       | `pnpm visual:reckful`               |
| Update Lighthouse activity data | `pnpm update:lighthouse-news`       |

## Agent Workflow Files

| Task                  | Path                               |
| --------------------- | ---------------------------------- |
| Task record template  | `.agents/templates/task-record.md` |
| Active task records   | `.agents/tasks/active/`            |
| Archived task records | `.agents/tasks/archive/`           |
| Workflow rules        | `docs/agent/WORKFLOW.md`           |

## App Commands

| Area                  | Dev                                   | Build                                                | Test                                        |
| --------------------- | ------------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Backend Nest          | `pnpm -C apps/backend-nest start:dev` | `pnpm -C apps/backend-nest build`                    | `pnpm -C apps/backend-nest test`            |
| Admin Next            | `pnpm -C apps/front-next-admin dev`   | `pnpm -C apps/front-next-admin build`                | no dedicated test script                    |
| Miniapp Taro          | `pnpm -C apps/miniapp-taro dev:weapp` | `pnpm -C apps/miniapp-taro build:weapp`              | no dedicated test script                    |
| Astro                 | `pnpm -C apps/frontend-astro dev`     | `pnpm -C apps/frontend-astro build`                  | no dedicated test script                    |
| Astro Lighthouse news | none                                  | `pnpm -C apps/frontend-astro update:lighthouse-news` | no dedicated test script                    |
| Utils package         | none                                  | `pnpm -C packages/utils build`                       | `pnpm -C packages/utils test`               |
| Const package         | none                                  | `pnpm -C packages/const build`                       | none                                        |
| Prisma client         | none                                  | `pnpm -C packages/prisma-client build`               | none                                        |
| VS Code extension     | watch via package scripts             | `pnpm -C apps/bo-retire-vsc-extension compile`       | `pnpm -C apps/bo-retire-vsc-extension test` |

## Ports and URLs

- Backend listens on `process.env.PORT ?? 3000`.
- Admin dev script uses Next on port `3001`.
- Astro default dev port is `4321`.
- Admin base path is `/rpg/admin`.
- Admin `next.config.ts` rewrites `/api/:path*` to `BOFANS_API_BASE_URL`, defaulting to local backend.
- Mini app `BASE_URL` is injected by `BOFANS_API_BASE_URL` at build time.

## Command Safety

### No-Confirmation Local Actions

Do not ask the user for additional confirmation before these low-risk actions during normal repo work:

- Run repo-local package commands such as `pnpm agent:lint`, `pnpm -C <app> build`, `pnpm -C <app> dev`, `pnpm test`, and environment checks like `command -v node`, `node --version`, `npm --version`, or `pnpm --version`.
- Run read-only local diagnostics such as `lsof -nP -iTCP:<port> -sTCP:LISTEN`, `ps` for a known PID, `git status`, `git diff`, `rg`, `sed`, `ls`, and similar inspection commands.
- Stop a local dev server that the agent started for verification. Prefer keeping the shell session controllable and stopping it with stdin; use `kill <pid>` only when the PID has been verified as the agent-started dev server.
- Run local read-only HTTP checks such as `curl -I http://127.0.0.1:<port>/...`, `curl -I http://localhost:<port>/...`, or Browser Use checks against `localhost` / `127.0.0.1`.
- Run known safe public-data refreshes documented here, currently `pnpm update:lighthouse-news`, which only reads Tencent Cloud's public Lighthouse page and rewrites local static JSON.

These actions are part of normal verification and should be recorded in task evidence rather than surfaced as user confirmations.

### Must-Confirm Actions

- Do not run commands that intentionally write to production services without explicit user approval.
- Do not run Prisma migrate commands unless the task is explicitly about schema/migration work.
- Prefer narrow tests first, then broader checks when the blast radius grows.
- `update:lighthouse-news` only reads the public Tencent Cloud Lighthouse page and rewrites local static JSON.
- Confirm before deploys, pushes, PR creation, destructive file/data operations, secrets or credential handling, auth/CORS/security policy changes, paid operations, or browser actions that submit/write to real external services.
