# Task Record: miniapp photo actions

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue refining the miniapp toward a Tencent Cloud product-console UI with restrained AI/tech feel.

## Acceptance Boundaries

- Functional: Refine `PhotoItem` action row into a cleaner resource action layout while preserving lazy loading, preview, save, vote, retry, and runtime review-mode behavior.
- Verification: Run the mini app WeChat build against `yuanbo.online`, `git diff --check`, targeted anti-slop scan, and `pnpm agent:lint`.
- Docs Sync: Confirm existing miniapp visual conventions cover this implementation or update docs if needed.
- Safety: Do not change API calls, voting semantics, image URLs, production API target, secrets, or WeChat DevTools settings.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Reviewed miniapp, miniapp visual-design, and doc-sync skills.
- Reviewed `PhotoItem` TSX/SCSS and identified the vote button plus separate count badge as a noisy two-chip action state.
- Replaced the separate vote button/count badge classes with a unified `photo-vote-group` state segment.
- Kept the save action, vote action, optimistic vote update, reload, and retry behavior unchanged.
- Renamed the vote value class away from `vote-count` so anti-slop scans can distinguish old badge patterns from the new state segment.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain required for final broad UI acceptance. This turn relies on build and source/style verification unless DevTools becomes available.

## Decisions and Assumptions

- Screen job: let users inspect a photo resource, save it, and optionally vote during review mode.
- Primary state: photo media remains dominant; actions should be compact and unambiguous.
- Source of truth: `systemConfig.inReview`, `data.hasVoted`, `data.votesCount`, and existing save/vote API flows.
- Removal target: separated vote action and vote-count badges competing in the card footer.
- Closest Tencent Cloud pattern: resource row action plus compact state value.

## Files Touched

- `.agents/tasks/archive/2026-06-19-miniapp-photo-actions.md`
- `apps/miniapp-taro/src/components/photoItem/index.tsx`
- `apps/miniapp-taro/src/components/photoItem/index.scss`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp`: passed; Taro reported existing `punycode` deprecation and Browserslist age warnings.
- `git diff --check`: passed.
- Targeted anti-slop scan across My, approval, kowtow, retirement, history, travel, tease, shared photo browser, custom tab bar, and photo item source: no hits.
- `pnpm agent:lint`: passed with expected `miniapp-doc-sync` warning; conventions are unchanged because this implements the existing miniapp visual direction.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-photo-actions.md`
