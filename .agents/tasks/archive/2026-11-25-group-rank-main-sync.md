# Task Record: Bring the group notebook into main

- State: complete
- Mode: full
- Started: 2026-11-25
- Branch: codex/group-rank-main-sync
- Request: Integrate the independent notebook into main and update its README documentation.

## Acceptance Boundaries

- Preserve the deployed notebook source and existing main changes.
- Document the current product, developer workflow, separate database, and release status.
- Verify the combined main tree in a temporary checkout and in PR CI.
- Skip the main push workflow for this merge because it also uploads the unrelated Astro site.

## Actions

- Merged the group notebook feature branch into a clean checkout based on origin/main.
- Checked that the Astro source and deployment workflow are identical to origin/main.
- Updated the repository overview, notebook setup and daily use, and the standalone deployment status.

## Verification Evidence

- `pnpm run verify`: passed on the integrated tree, including 139 backend tests and the Astro build.
- `pnpm exec vitest run apps/group-rank-miniapp/src scripts/group-rank-ui-preview/entry.test.ts`: 330 passed.
- `python3 scripts/test-group-rank-database.py`: 28 tests passed against disposable PostgreSQL.
- Miniapp typecheck, production API build, and official WXML validation passed. The build manifest digest matches the 1.0.6 development build.
- Relative README links checked, `git diff --check` and `pnpm agent:lint` passed.

## Handoff / Archive Notes

- The integration candidate is complete. GitHub retains the PR CI and merge result.
- Archive path: `.agents/tasks/archive/2026-11-25-group-rank-main-sync.md`
