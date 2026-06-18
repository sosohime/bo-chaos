# Task Record: Miniapp Tabbar Line Icon Polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app UI toward a Tencent Cloud-style product console by fixing the bottom tab bar active/inactive visual quality.

## Acceptance Boundaries

- Functional: Change only mini app visual presentation for the custom tab bar; keep tab visibility, runtime config, UGC filtering, routing, and API behavior unchanged.
- Verification: Build the WeChat mini app, run agent lint, and run whitespace checks.
- Docs Sync: No architecture or command docs expected unless the implementation changes conventions.
- Safety: Do not touch production targets, secrets, or deploy state.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Read mini app and mini app visual design skills.
- Inspected current custom tab bar TSX/SCSS and existing tab icon assets.
- Generated a local contact sheet for existing tab icon assets and found they skew legacy/illustrative rather than product-console.
- Reworked the tab bar visual system to use stable line glyphs, a fixed 30px icon shell, restrained active background, and calmer inactive states.

## Iteration Log

- Design diagnosis: the bottom tab bar appears on every screen, so its inconsistent hand-drawn glyph weights and decorative selected underline make the whole app feel less like a real product surface.
- Above-fold job: preserve stable global navigation while making the current module clear.
- Cheap/noisy elements to remove: mismatched glyph strokes, active bottom border inside icon shell, and selected styles that feel decorative rather than operational.

## Deferred Verification

- WeChat DevTools screenshot verification remains unavailable from this execution context.

## Decisions and Assumptions

- Keep custom CSS glyphs instead of reverting to legacy PNG assets because the current assets include illustrative smile/DNA/compass-style imagery that does not match the Tencent Cloud console direction.

## Files Touched

- `apps/miniapp-taro/src/custom-tab-bar/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-tabbar-line-icon-polish.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro compiled successfully with existing Browserslist staleness and Node `punycode` warnings.
- `git diff --check`: passed.
- `pnpm agent:lint`: initially failed because this task record reused a name already present in archive; renamed the active record to avoid duplicate active/archive task state.
- `pnpm agent:lint`: passed after the task record rename, with the expected miniapp-doc-sync warning. `docs/agent/CONVENTIONS.md` is unchanged because this turn only adjusts tab bar presentation, not mini app engineering conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-tabbar-line-icon-polish.md`
