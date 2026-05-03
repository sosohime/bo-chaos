# Task Record: Bo responsive sections

- State: archived
- Started: 2026-05-04
- Archived: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Remove the source link, fix the peripherals copy, and make `/bo` sections more reasonable and responsive before generating three visual directions.

## Acceptance Boundaries

- Functional: `/bo` removes `来源页面`; `周边` no longer uses awkward header copy; `动态`, `周边`, and `Fans` fit better with responsive layout.
- Verification: Run Astro build, browser-check `/bo`, inspect console logs, run `pnpm agent:lint`, then generate three image2 directions.
- Docs Sync: No agent docs change expected.
- Safety: Local Astro UI change plus image generation only; no external writes or deploy actions.
- Archive: Archive the completed record.

## Actions

- Created task record.
- Removed the `来源页面` link from `/bo`.
- Tightened the `动态` section spacing.
- Combined `周边` and `Fans` into a responsive two-column row on wider screens, stacked on narrow screens.
- Changed Fans row action text from `退休倒计时` to `进入`.
- Changed mobile alignment to start at the top while keeping wider screens centered.
- Changed `周边` side copy to `当前 1 个`.

## Decisions and Assumptions

- Keep the page minimal and information-dense; avoid cards or decorative blocks.
- Treat `周边` as an expandable directory, with the current count visible instead of a descriptive slogan.

## Files Touched

- `.agents/tasks/archive/2026-05-04-bo-responsive-sections.md`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- Browser check `http://127.0.0.1:4321/bo`: passed.
- Browser text checks: `来源页面` count `0`; `动态`, `周边`, `当前 1 个`, `Fans`, `合成大鸽子`, `Reckful` all count `1`.
- Browser console check after reload: recent error count `0`.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: archived.
- Image2 visual directions are generated after this archive step.
