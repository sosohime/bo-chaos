# Task Record: Astro retire path conventions

- State: complete
- Mode: full
- Started: 2026-05-12
- Branch: codex/fix-codex-pet-preview-path
- Request: Turn the codex-pet broken preview path into a shared Astro path convention instead of a one-off fix.

## Acceptance Boundaries

- Functional: Astro pages and public assets use one helper-backed `/retire` prefix convention; no tracked files remain under `apps/frontend-astro/public/retire/`.
- Verification: `pnpm agent:lint`, `pnpm -C apps/frontend-astro build`, and build artifact path checks pass.
- Docs Sync: Agent conventions and frontend debug docs describe the Astro deploy prefix and public asset rule.
- Safety: No production deploy, direct `main` push, or external write without explicit approval.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Added an `agent-lint` guard that fails when tracked Astro public assets live under `public/retire` or page/component source hard-codes deployed site paths instead of using the helper.
- Confirmed the new guard fails on the pre-fix state for `public/retire/bo.ico` and hard-coded `/retire` page/component paths.
- Added `sitePath('/...')` as the single source for deployed Astro public-site URLs.
- Migrated favicon, codex-pet preview image URL, back link, and codex-pet entry link to `sitePath`.
- Removed the duplicate tracked `public/retire/bo.ico`; public assets now live relative to the deployed root.
- Documented the deploy-prefix/public-asset rule in agent conventions and frontend debug docs.

## Iteration Log

- Not visual-fast-lane.

## Deferred Verification

- None.

## Decisions and Assumptions

- Keep the existing CI upload contract where `dist/` is uploaded to server path `retire`.
- Do not switch Astro `base` in this change because it would require coordinating route output and CI deployment paths.

## Files Touched

- `scripts/agent-lint.mjs`
- `apps/frontend-astro/src/lib/site-paths.ts`
- `apps/frontend-astro/src/layouts/Layout.astro`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`
- `apps/frontend-astro/src/pages/bo/codex-pet.astro`
- `apps/frontend-astro/public/codex-pets/expertbo-preview.png`
- `apps/frontend-astro/public/retire/codex-pets/expertbo-preview.png`
- `apps/frontend-astro/public/retire/bo.ico`
- `packages/codex-pets/README.md`
- `docs/agent/CONVENTIONS.md`
- `docs/agent/FRONTEND_DEBUG.md`

## Verification Evidence

- `pnpm agent:lint` before implementation: failed with `astro-public-retire-prefix` and `astro-hardcoded-site-prefix`, proving the guard catches the existing problem.
- `pnpm agent:lint` after implementation: exited 0 with only `agents-toc-check` warning; AGENTS.md already links to the changed L2 docs and no new doc was added.
- `pnpm -C apps/frontend-astro build`: passed.
- `test -f apps/frontend-astro/dist/codex-pets/expertbo-preview.png`: passed.
- `test ! -e apps/frontend-astro/dist/retire`: passed.
- `rg` over generated HTML: confirmed `/retire/bo`, `/retire/bo/codex-pet`, `/retire/bo.ico`, and `/retire/codex-pets/expertbo-preview.png` are emitted.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-12-astro-retire-paths.md`
