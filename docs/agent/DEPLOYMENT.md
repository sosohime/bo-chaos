# Agent Deployment Notes

Deployment automation is intentionally out of scope for v1.

## Current Position

- Do not push, create PRs, deploy, or run production rollout commands without explicit user approval.
- Use this file later to document production targets, rollback procedures, secrets, environment variables, and CI/CD commands.
- Current BoFans production host is reached through the local SSH alias `bo-chaos-101` for `101.34.252.219`.
- PM2 runs admin as `nextjs-app` and backend workers as `main` from `/usr/soso/github/bo-chaos`.

## BoFans Replacement Checklist

Before destructive Prisma migrations or service replacement:

- Backup the database with a timestamped dump.
- Backup `/usr/soso/github/bo-chaos`, app `.env`, PM2 process config, and nginx config.
- Build and verify locally first: backend test/build, admin build or documented build blocker, miniapp build, package build, and `pnpm agent:lint`.
- Apply Prisma migrations before restarting backend code that depends on the new generated client.
- Smoke test `global/systemConfig`, category listing, photo listing/detail, admin review listing, and kowtow stats.
- On failure, stop the new PM2 processes, restore the previous release and database dump or rollback SQL, then restart the previous PM2 config.

## Future v2 Topics

- GitHub Actions split by changed app.
- Preview deploys for admin and Astro.
- Backend deploy and migration ordering.
- Safe rollback checklist.
- Agent-readable deployment failure triage.
