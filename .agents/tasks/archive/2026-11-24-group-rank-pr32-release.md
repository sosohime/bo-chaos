# Task Record: Group notebook PR 32 review and development build

- State: complete
- Mode: full
- Started: 2026-11-24
- Branch: codex/group-rank-directory-refresh
- Request: Review PR 32, merge and deploy after validation, and prepare the WeChat development build.

## Acceptance Boundaries

- Review directory ordering, recommendation notes, access boundaries, and migration order.
- Verify health against the independent database before and after the new migrations.
- Keep the miniapp bundle within the existing package budget and use the production API in the development build.
- Release the independent group service and prepare a development build only.

## Actions

- Added both new fields to the database readiness check.
- Removed the unreferenced catalog title from the copy list and its old packaging assertion. The source artwork remains in the repository.
- Ran backend, real PostgreSQL, client, and type checks in an isolated checkout. The existing data model documentation covers both schema changes.

## Verification Evidence

- Backend: 139 tests passed and Nest compiled.
- Disposable PostgreSQL: 28 integration tests passed.
- Miniapp: 328 tests passed and typecheck passed.
- Deployment verification runs against a restored copy before switching the live process.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-24-group-rank-pr32-release.md`
