# Task Record: miniapp retire command console polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue moving the mini app toward a Tencent Cloud console-style UI with restrained AI/tech taste.

## Acceptance Boundaries

- Functional: The Bo retirement quick actions should read as compact console commands rather than large template cards, while preserving copy and navigation behavior.
- Verification: Run mini app WeApp build with production API base, `git diff --check`, anti-slop scans on touched files, and `pnpm agent:lint`.
- Docs Sync: Update task record and explain if source-only visual polish does not require L2 doc changes.
- Safety: Do not change retirement constants, copy payloads, navigation targets, production API targets, auth, or runtime config behavior.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Read mini app, mini app visual design, doc sync skills, and relevant agent docs.
- Scanned mini app source for remaining generic visual effects, old button treatments, and unverifiable copy.
- Inspected the Bo retirement page and identified the quick-action panel as a high-impact area for reducing template/card-button feel.
- Reworked the quick-action SCSS into a denser command-list treatment without changing TSX behavior.

## Iteration Log

- This pass targets the retirement first-screen flow, using Tencent Cloud-style command rows and subtle blue state accents rather than decorative AI visuals.

## Deferred Verification

- WeChat DevTools or real-device visual inspection remains required for final broad UI acceptance.

## Decisions and Assumptions

- Retirement countdown values remain canonical from `@mono/const`; no retirement rule or progress calculation changed.
- No generated bitmap slice was added because the target issue is interaction chrome, and adding art would make the command panel less product-like.
- No L2 agent docs need updates because no convention, command, architecture, data contract, or workflow rule changed.

## Files Touched

- `apps/miniapp-taro/src/pages/retire/index.scss`
- `.agents/tasks/active/2026-06-18-miniapp-retire-command-console.md`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro/Webpack compiled successfully, with existing Browserslist staleness warnings.
- `git diff --check`: passed.
- Anti-slop scan on touched files: only hit `48px` dimensions and this task's AI/tech request wording; no fake metrics, marketing copy, glow, gradient, or hard-coded retirement-rule copy in touched source styles.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; docs unchanged because this is source-only visual polish and no conventions changed.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-retire-command-console.md`
