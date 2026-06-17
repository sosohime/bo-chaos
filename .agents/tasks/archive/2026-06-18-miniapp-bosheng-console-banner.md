# Task Record: Miniapp BoSheng Console Banner

- State: active
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Continue aligning the mini app with a Tencent Cloud product-console style and restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Rework the birthday banner shared across miniapp pages so it reads as a restrained console event banner rather than a marquee ad.
- Verification: Run miniapp WeChat build and `pnpm agent:lint`.
- Docs Sync: Agent docs unaffected unless conventions, commands, routing, or architecture change.
- Safety: No API, production target, secret, or data mutation changes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Started from a clean worktree at commit `c1a1e58`.
- Read miniapp skill and inspected the shared `BoSheng` component and consumers.
- Replaced duplicated marquee birthday copy with a static event-status banner.
- Restyled the banner as a white bordered console surface with event label and status badge.
- Removed marquee keyframes and absolute-positioned text.

## Iteration Log

- Continuing visual alignment after shared state panel polish.
- Current focus: cross-page birthday/event banner.

## Deferred Verification

- None.

## Decisions and Assumptions

- Keep the birthday signal, but remove repeated marquee copy that makes the app feel ad-like.
- Component remains conditional on `isBoSheng()`.

## Files Touched

- `.agents/tasks/active/2026-06-18-miniapp-bosheng-console-banner.md`
- `apps/miniapp-taro/src/components/boSheng/index.tsx`
- `apps/miniapp-taro/src/components/boSheng/index.scss`

## Verification Evidence

- `pnpm exec prettier --write apps/miniapp-taro/src/components/boSheng/index.tsx apps/miniapp-taro/src/components/boSheng/index.scss .agents/tasks/active/2026-06-18-miniapp-bosheng-console-banner.md`: passed.
- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed with existing Browserslist stale-data and `punycode` warnings.
- `pnpm agent:lint`: passed with warning `miniapp-doc-sync`; reviewed docs impact and left `docs/agent/CONVENTIONS.md` unchanged because this is visual structure/style work, not a convention change.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-bosheng-console-banner.md`
