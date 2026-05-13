# Task Record: shadowbo Codex pet

- State: complete
- Mode: full
- Started: 2026-05-13
- Branch: codex/fix-codex-pet-preview-path
- Request: Add a second Codex GUI pet named shadowbo / 影流Bo with install docs and front-end entry.

## Acceptance Boundaries

- Functional: `packages/codex-pets/pets/shadowbo` contains pet metadata, preview, spritesheet, and source image; install scripts support `shadowbo`; `/bo/codex-pet` shows ExpertBo and 影流Bo.
- Verification: validate PNG dimensions and JSON; verify local install script output structure; run `pnpm -C apps/frontend-astro build` and `pnpm agent:lint`.
- Docs Sync: update user-facing READMEs; update agent docs only if workflow/routing/command conventions change.
- Safety: no production writes, no secrets, no deployment, no push.
- Archive: move this record to `.agents/tasks/archive/` before final response.

## Actions

- Created task record before implementation.
- Generated the first shadowbo asset from a standalone image prompt, then replaced it after review because the correct reference is `packages/codex-pets/pets/expertbo/spritesheet.png`.
- Regenerated `shadowbo` by reading each 192x208 cell from the ExpertBo spritesheet and composing three identical Bo copies with only positional offsets.
- Added shadowbo pet metadata, macOS/Linux installer, and Windows PowerShell installer.
- Updated the Codex pet README, root README, Bo landing entry, and `/bo/codex-pet` page for a two-pet install surface.
- Verified the built `/retire/bo/codex-pet/` page with headless Chrome against a local static server.

## Iteration Log

- Not using visual-fast-lane; this task changes assets, scripts, docs, and Astro page structure.

## Deferred Verification

- None.

## Decisions and Assumptions

- Pet ID is `shadowbo`; display name is `影流Bo`; Codex custom selector should show `custom:shadowbo`.
- The visual should be three real Bo copies with the exact same action in each frame, only offset by position.
- The generated spritesheet must derive from `packages/codex-pets/pets/expertbo/spritesheet.png`, not from the preview image or a standalone generated character.
- Existing ExpertBo behavior remains unchanged.
- Astro public paths should use the existing `sitePath('/codex-pets/...')` convention.
- Agent docs are unaffected because no routing, workflow, command, data, or architecture convention changed.

## Files Touched

- `packages/codex-pets/pets/shadowbo/pet.json`
- `packages/codex-pets/pets/shadowbo/preview.png`
- `packages/codex-pets/pets/shadowbo/spritesheet.png`
- `packages/codex-pets/pets/shadowbo/source-expertbo-spritesheet-reference.png`
- `packages/codex-pets/install-shadowbo.sh`
- `packages/codex-pets/install-shadowbo.ps1`
- `apps/frontend-astro/public/codex-pets/shadowbo-preview.png`
- `apps/frontend-astro/src/pages/bo/codex-pet.astro`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`
- `packages/codex-pets/README.md`
- `README.md`

## Verification Evidence

- PNG/JSON static check: `preview.png` 192x208 RGBA, `spritesheet.png` 1536x1872 RGBA, public preview 192x208 RGBA, `pet.json` selects `spritesheet.png`.
- Local install check: `CODEX_HOME=/private/tmp/bo-chaos-shadowbo-install-test BASE_URL=file:///Users/heyesheng/Documents/code/heyesheng/bo-chaos/packages/codex-pets PET_ID=shadowbo bash packages/codex-pets/install-shadowbo.sh` wrote `pet.json` and `spritesheet.png`.
- `pnpm -C apps/frontend-astro build`: passed; Sentry auth-token warnings and stale Browserslist warning are existing environment warnings.
- `pnpm agent:lint`: passed.
- Headless Chrome check at `http://127.0.0.1:4174/retire/bo/codex-pet/`: title matched, `影流Bo` text present, both preview images loaded, no horizontal overflow at 390px viewport, no console/page errors.
- PowerShell runtime check skipped because no `pwsh` or `powershell` binary is installed locally; script was statically checked for `shadowbo`, `pet.json`, `spritesheet.png`, and `custom:shadowbo`.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-13-shadowbo-codex-pet.md`
