# Task Record: Bo countdown controls

- State: archived
- Started: 2026-05-04
- Archived: 2026-05-04
- Branch: codex/agent-harness-validation
- Request: Restore milliseconds, UTC+8, and copy text action in the countdown area only, using selected parts from the three image2 options.

## Acceptance Boundaries

- Functional: Command countdown shows milliseconds as a light suffix, `UTC+8` in the frame top-left, and `复制文案` outside the frame bottom-right.
- Scope: Do not change `动态`, `周边`, or `Fans` layout/content.
- Verification: Run Astro build, browser-check `/bo`, inspect console logs, run `pnpm agent:lint`.
- Docs Sync: No L2 docs expected.
- Safety: Local Astro UI fix only.
- Archive: Create archive record when verification passes.

## Actions

- Added `UTC+8` to the command frame top-left.
- Added visible milliseconds as a light `.xxx` suffix after seconds.
- Restored the copy action as a small outlined `复制文案` button outside the frame bottom-right.
- Moved `UTC+8` onto the frame corner so it does not crowd the digits.
- Added a textarea-based copy fallback after Browser verification showed `navigator.clipboard.writeText` can fail in the current environment.
- Changed the copy order to try synchronous selection-copy before async Clipboard API.
- Left `动态`, `周边`, and `Fans` untouched.

## Decisions and Assumptions

- Use option A for UTC+8 placement, option B for milliseconds style, and option C for copy action style.

## Files Touched

- `.agents/tasks/archive/2026-05-04-bo-countdown-controls.md`
- `apps/frontend-astro/src/components/tuixiu/countdown.astro`

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed.
- Browser check `http://127.0.0.1:4321/bo`: passed.
- Browser text/value checks: `UTC+8` count `1`, `复制文案` count `1`, `查看全部` count `0`, `合成大鸽子` count `1`, `Reckful` count `1`, milliseconds field populated.
- Browser screenshot check: `UTC+8`, milliseconds suffix, and copy action are all visually limited to the countdown area.
- Browser console check after reload: recent error count `0`.
- Copy click verification: both Playwright click and CUA click returned `复制失败` in the in-app browser, despite Clipboard API plus selection-copy fallback; no console error was emitted. Treat as an embedded-browser clipboard permission limitation to recheck in real Chrome.
- `pnpm agent:lint`: passed.

## Handoff / Archive Notes

- Final state: archived.
