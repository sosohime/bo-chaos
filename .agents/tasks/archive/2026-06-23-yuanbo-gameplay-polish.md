# Task Record: Yuanbo gameplay polish

- State: complete
- Mode: full
- Started: 2026-06-23
- Branch: codex/miniapp-tech-refactor
- Request: Improve gameplay feel, Bo pet likeness, emotional sprites, and boshuo-driven story direction for Yuanbo RPG.

## Acceptance Boundaries

- Functional: Movement should be smooth, mobile controls should not jump the player, Bo should better resemble the Bo pet image, and story/dialog should use boshuo tone around the售后收钱 joke.
- Verification: Astro build, agent lint, and browser checks for mobile movement/adaptation and no console errors.
- Docs Sync: No docs changes expected beyond this task record.
- Safety: Local frontend only.
- Archive: Move record to archive when complete.

## Actions

- Spawned three subagents: story/boshuo, pixel art direction, Phaser movement/UI diagnosis.
- Started local implementation with movement smoothing and sprite/dialog improvements.
- Replaced mobile four-button movement bridge with a real DOM joystick and interaction button.
- Removed global movement nudging and Phaser round-pixel snapping; WorldScene now lerps a movement vector from keyboard or analog joystick input.
- Added robust pointer tracking for the joystick, including pointer-capture fallback for embedded/synthetic environments.
- Updated Bo runtime textures with stronger Bo pet cues: glasses, hair, black/cyan outfit, white shoes, plus talk/win/fail/shock/shadow mood sprites.
- Used the existing Bo pet image in Phaser negotiation and result scenes as an in-game portrait reference, instead of only relying on hand-drawn pixels.
- Updated quest, skill, training, and event copy using boshuo-style tone particles and a sanitized售后收费/边界感 version of the user's joke.
- Fixed mobile save-state normalization so refreshed player positions do not snap upward on tall mobile maps.

## Iteration Log

- User rejected current game feel, movement jitter, Bo likeness, and shallow story framing.

## Deferred Verification

- Synthetic joystick drag could not be fully automated because the in-app browser's evaluate sandbox lacks standard `PointerEvent`/`Event` constructors and `document.createEvent`; layout and code-level pointer flow were still verified.

## Decisions and Assumptions

- Use boshuo as tone particles, not as raw long content.
- Avoid explicit sexual depiction; convert joke into售后收费/边界感 absurdity.

## Files Touched

- `apps/frontend-astro/src/game/yuanbo/main.ts`
- `apps/frontend-astro/src/game/yuanbo/data.ts`
- `apps/frontend-astro/src/game/yuanbo/state.ts`
- `apps/frontend-astro/src/pages/bo/yuanbo-game.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build` passed.
- `pnpm agent:lint` passed with unrelated existing agent warnings for multiple active task records, a 2026-06-22 task record mode, command-doc sync, and AGENTS toc sync.
- Browser mobile check at 390x844: canvas 390x844, joystick present, interact button present, no horizontal overflow, no console errors beyond Vite/Phaser startup logs.
- Browser desktop check at 1280x800: canvas 1280x720, mobile touch bridge hidden, no horizontal overflow.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-23-yuanbo-gameplay-polish.md`
