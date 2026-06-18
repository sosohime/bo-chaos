# Task Record: miniapp kowtow action label

- State: archived
- Mode: full
- Started: 2026-06-19
- Branch: codex/miniapp-tech-refactor
- Request: Continue miniapp interaction polish by replacing the remaining vague kowtow action label with concrete wording.

## Acceptance Boundaries

- Functional: Rename the kowtow action kicker while preserving local queue writes, stats sync, retry behavior, canvas feedback, and API calls.
- Verification: Run the miniapp WeChat build against `yuanbo.online`, `git diff --check`, anti-slop scans, and `pnpm agent:lint`.
- Docs Sync: Confirm existing `apps/miniapp-taro/DESIGN.md` covers concrete action wording or update docs if a durable new rule is introduced.
- Safety: Do not change kowtow API calls, sync interval, runtime review switch, animation behavior, production API target, or stats sources.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Global scan found the remaining vague `操作` label in the kowtow action footer.
- Renamed the action kicker to `写入队列`.
- Preserved local queue writes, stats sync, retry behavior, canvas feedback, and API calls.

## Iteration Log

- N/A.

## Deferred Verification

- WeChat DevTools screenshots remain unavailable unless the local service port is enabled; this turn relies on build, source inspection, and anti-slop scans.

## Decisions and Assumptions

- Screen job: make the primary kowtow write action obvious before tapping.
- Primary state: local queue write availability.
- Source of truth: existing local queue and stats state remain unchanged.
- Removal target: vague `操作` kicker.
- Closest Tencent Cloud pattern: concrete action section label.

## Files Touched

- `.agents/tasks/active/2026-06-19-miniapp-kowtow-action-label.md`
- `apps/miniapp-taro/src/pages/kowtow/index.tsx`

## Verification Evidence

- `BOFANS_API_BASE_URL=https://yuanbo.online/rpg/bofans pnpm -C apps/miniapp-taro build:weapp` passed; Taro compiled successfully with the existing Browserslist stale-data warning.
- `git diff --check` passed.
- Global anti-slop scan found no banned marketing/AI/fake-count/old-retirement/meta/vague-action terms; only tabbar fixed positioning `left: 0` remains.
- `pnpm agent:lint` passed with `miniapp-doc-sync` warning; no docs update needed because `apps/miniapp-taro/DESIGN.md` already covers concrete action wording.

## Handoff / Archive Notes

- Final state: archived
- Archive path: `.agents/tasks/archive/2026-06-19-miniapp-kowtow-action-label.md`
