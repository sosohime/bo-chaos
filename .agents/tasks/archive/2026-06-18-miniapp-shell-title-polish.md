# Task Record: miniapp shell title polish

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue aligning the mini app UI with Tencent Cloud console style and restrained technology feel.

## Acceptance Boundaries

- Functional: Preserve routing, runtime title overrides, sharing behavior, tabs, and API behavior.
- Verification: Run mini app WeChat build, agent lint, anti-slop scan, and diff whitespace checks.
- Docs Sync: Note whether conventions need updates.
- Safety: Do not change API targets, auth, secrets, schema, or production behavior.
- Archive: Move completed record to `.agents/tasks/archive/`.

## Actions

- Read mini app and visual design skills.
- Audited app/page configs, navigation titles, and share titles.
- Identified shell-level copy that still used older generic/marketing labels such as `历史`, `审批`, `快来...`.
- Changed the global navigation bar background to white to better match the console shell.
- Updated page initial navigation titles to resource-oriented names.
- Replaced marketing share titles with concise product/resource titles while preserving existing share paths.
- Tightened default review-mode photo titles in runtime config from loose category copy to concise resource copy.

## Iteration Log

- Design diagnosis: app shell should reinforce the product-console surface before page data finishes loading.
- Removal target: marketing share copy and vague navigation titles that mismatch resource panels.

## Deferred Verification

- WeChat DevTools screenshot capture remains unavailable from prior audits; rely on build, lint, source inspection, and scans as partial evidence.

## Decisions and Assumptions

- Use concise resource names for initial navigation and share titles; keep runtime config overrides intact.

## Files Touched

- `apps/miniapp-taro/src/app.config.ts`
- `apps/miniapp-taro/src/lib/runtime-config.ts`
- `apps/miniapp-taro/src/pages/approve/index.config.ts`
- `apps/miniapp-taro/src/pages/history/index.config.ts`
- `apps/miniapp-taro/src/pages/history/index.tsx`
- `apps/miniapp-taro/src/pages/kowtow/index.config.ts`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`
- `apps/miniapp-taro/src/pages/my/index.config.ts`
- `apps/miniapp-taro/src/pages/my/index.tsx`
- `apps/miniapp-taro/src/pages/tease/index.config.ts`
- `apps/miniapp-taro/src/pages/tease/index.tsx`
- `apps/miniapp-taro/src/pages/travel/index.config.ts`
- `apps/miniapp-taro/src/pages/travel/index.tsx`
- `.agents/tasks/archive/2026-06-18-miniapp-shell-title-polish.md`

## Verification Evidence

- Shell/title anti-slop scan for old marketing and vague title terms: no matches.
- `git diff --check`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist and `punycode` warnings.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning because this is source-only shell/copy polish under existing conventions.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-shell-title-polish.md`
