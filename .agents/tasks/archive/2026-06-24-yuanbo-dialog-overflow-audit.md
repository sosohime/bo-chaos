# Task Record: Yuanbo Dialog Overflow Audit

- State: active
- Mode: full
- Started: 2026-06-24
- Branch: codex/yuanbo-game-rpg-polish
- Request: Continue auditing normal web-window dialog and button overflow in the Yuanbo game.

## Acceptance Boundaries

- Functional: Opening, board, training, quest brief, menu/dossier, and negotiation button layouts stay inside their visible panels at a normal desktop web viewport.
- Verification: Automated browser screenshots at 900x650, Astro build, agent lint.
- Safety: Do not stage or alter unrelated miniapp/docs dirty files.
- Archive: Move this record to `.agents/tasks/archive/` after verification.

## Actions

- Re-ran a broader 900x650 Playwright screenshot audit across representative game dialogs.
- Found quest brief buttons still overflowing because `quest`/`boss` modals used the short dialog panel.
- Promoted `quest` and `boss` modals to the rich/tall panel layout.

## Verification Evidence

- Browser screenshot audit at 900x650 generated `/tmp/yuanbo-ui-audit-2/01-opening-dialog.png` through `/tmp/yuanbo-ui-audit-2/07-negotiation-buttons.png`; no document horizontal overflow and no browser errors.
- Quest brief screenshot confirms all five buttons are inside the panel after the change.
- `pnpm -C apps/frontend-astro build`: passed.
- `pnpm agent:lint`: passed after archive with pre-existing unrelated agent docs TOC warning.
