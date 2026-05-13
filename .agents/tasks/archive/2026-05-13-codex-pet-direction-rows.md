# Task Record: Codex pet direction rows

- State: complete
- Mode: full
- Started: 2026-05-13
- Branch: codex/fix-codex-pet-preview-path
- Request: Fix Bo Codex pets always showing the left-walk sprite when dragged horizontally.

## Acceptance Boundaries

- Functional: ExpertBo and ShadowBo use opposite-facing sprites for the horizontal walk rows while keeping the 8x9, 192x208 cell layout.
- Verification: Compare against the working Miku pet layout, check PNG dimensions/mode, validate manifests, update local installed pets.
- Docs Sync: No agent docs expected unless workflow or commands change.
- Safety: Do not change unrelated pet metadata, install scripts, or frontend copy.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Compared the working local Miku pet spritesheet with ExpertBo and ShadowBo.
- Found Miku row 1 faces right and row 2 faces left, while both Bo pets had row 1 and row 2 facing left.
- Mirrored row 1 one 192x208 cell at a time for ExpertBo and ShadowBo, preserving frame order and spritesheet dimensions.
- Updated the ShadowBo ExpertBo source reference to match the corrected ExpertBo spritesheet.
- Reinstalled ExpertBo and ShadowBo into `/Users/heyesheng/.codex/pets`.

## Iteration Log

- N/A

## Deferred Verification

- None.

## Decisions and Assumptions

- Preserve frame order by mirroring each 192x208 cell in row 1 individually instead of mirroring the whole row strip.
- Treat Miku as the working reference for Codex pet horizontal direction row order.

## Files Touched

- `packages/codex-pets/pets/expertbo/spritesheet.png`
- `packages/codex-pets/pets/shadowbo/spritesheet.png`
- `packages/codex-pets/pets/shadowbo/source-expertbo-spritesheet-reference.png`
- `/Users/heyesheng/.codex/pets/expertbo/pet.json`
- `/Users/heyesheng/.codex/pets/expertbo/spritesheet.png`
- `/Users/heyesheng/.codex/pets/shadowbo/pet.json`
- `/Users/heyesheng/.codex/pets/shadowbo/spritesheet.png`
- `.agents/tasks/archive/2026-05-13-codex-pet-direction-rows.md`

## Verification Evidence

- `file packages/codex-pets/pets/expertbo/spritesheet.png packages/codex-pets/pets/shadowbo/spritesheet.png`: both are `1536 x 1872`, RGBA PNG.
- `node` manifest check: ExpertBo and ShadowBo `pet.json` parse and both point to `spritesheet.png`.
- `shasum -a 256`: installed ExpertBo spritesheet matches repo hash `31bc91ff...`; installed ShadowBo spritesheet matches repo hash `e212153d...`.
- `file /Users/heyesheng/.codex/pets/expertbo/spritesheet.png /Users/heyesheng/.codex/pets/shadowbo/spritesheet.png`: both installed spritesheets are `1536 x 1872`, RGBA PNG.
- `pnpm agent:lint`: `agent-lint: ok`.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-13-codex-pet-direction-rows.md`
