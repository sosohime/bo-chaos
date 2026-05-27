# Task Record: boshuo skill voice backfill

- State: complete
- Mode: full
- Started: 2026-05-27
- Branch: main
- Request: Sync latest `main` and check whether the public `boshuo` skill lost voice material from the fuller persona draft, especially phrases like `又无敌了`.

## Acceptance Boundaries

- Functional: Compare the current public skill against the fuller local persona draft and backfill missing low-privacy voice particles into `packages/agent-skills/skills/boshuo/SKILL.md`.
- Verification: Confirm the requested missing phrase family appears in the skill, run the narrow script/build checks, and run agent lint.
- Docs Sync: No L2 agent docs update expected because this only changes a public skill content file.
- Safety: Do not commit raw chat or local analysis exports; use only low-privacy synthetic phrasing.
- Archive: Keep this record in `.agents/tasks/archive/` before final response.

## Actions

- Fast-forwarded local `main` to the latest `origin/main`.
- Confirmed the current `boshuo` skill was a compressed public version and did not include `又无敌了` / `这不无敌了` style particles from the fuller local draft.
- Backfilled additional low-privacy particles: short reactions,反问, rough status particles,无敌/属于是/嘎嘎猛 style exaggeration, generalized `这b{thing}看着就闹心` phrasing, and expanded frontend teasing examples.
- Corrected the primary trigger to `让博哥说`, and changed `臭氧层子` / `都是说法` usage to adjective-like standalone evaluations instead of action objects.
- Updated the public page copy from install-only to install/update wording for repeatable skill refreshes.
- Kept the skill experiential: examples and sentence shapes only, no private transcript, no analysis prose.

## Verification Evidence

- `rg -n "又无敌了|这不无敌了|什么意思呢|我有个问题|来都来了|下次一定|嘎嘎猛|嗷嗷一顿整|几把的|这b\\{thing\\}看着就闹心" packages/agent-skills/skills/boshuo/SKILL.md`: all requested/high-signal backfill phrases found.
- `bash -n packages/agent-skills/install-boshuo.sh`: passed.
- `pnpm -C apps/frontend-astro build`: passed; Sentry auth-token warning only.
- `pnpm agent:lint`: passed.
- Updated verification: scans found no stale trigger wording or object/action-style `臭氧层子` / combined `都是说法` phrasing after semantic cleanup.
- Updated verification: `bash -n packages/agent-skills/install-boshuo.sh`, `pnpm -C apps/frontend-astro build`, and `pnpm agent:lint` passed again after semantic cleanup.
- Updated verification: page copy scan found `安装/更新博说 Skill` and install/update prompt wording; `pnpm -C apps/frontend-astro build` and `pnpm agent:lint` passed again.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-27-boshuo-skill-voice-backfill.md`
