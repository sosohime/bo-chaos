# Task Record: miniapp visual verification gate

- State: active
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue the miniapp Tencent Cloud style refactor by hardening the visual verification workflow.

## Acceptance Boundaries

- Functional: Document a repeatable WeChat miniapp visual verification gate for the BoChaos console-style UI direction.
- Verification: Run `git diff --check`, a targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Update the relevant agent frontend debug documentation.
- Safety: Do not enable WeChat DevTools service-port settings or perform production writes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, visual-design, and doc-sync skills.
- Reviewed routing, conventions, quality, workflow, and frontend debug docs.
- Confirmed the worktree was clean on `codex/miniapp-tech-refactor` before editing.
- Added a WeChat miniapp visual verification section to `docs/agent/FRONTEND_DEBUG.md`.
- Recorded DevTools service-port handling, screenshot scope, UGC visibility checks, and Tencent Cloud console acceptance criteria.

## Iteration Log

- N/A.

## Deferred Verification

- Real WeChat DevTools screenshots remain required for final broad UI acceptance; prior CLI automation was blocked by the local DevTools service-port setting.

## Decisions and Assumptions

- The verification gate should use Tencent Cloud product-console fit as the judge while avoiding fake AI, marketing, and unverifiable metrics.
- The gate should treat source scans and builds as partial evidence only; WeChat DevTools or real-device screenshots are stronger visual evidence.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-visual-verification-gate.md`
- `docs/agent/FRONTEND_DEBUG.md`

## Verification Evidence

- `git diff --check`: passed.
- Targeted anti-slop scan across `apps/miniapp-taro/src`, `docs/agent/FRONTEND_DEBUG.md`, and this task record: no mini app source hits; documentation hits were explanatory banned-pattern references.
- `pnpm agent:lint`: passed with `agents-toc-check` warning because `docs/agent/FRONTEND_DEBUG.md` changed without `AGENTS.md`; no L1 update needed because no docs were added, renamed, or removed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-visual-verification-gate.md`
