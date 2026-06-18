# Task Record: miniapp visual skill taste refresh

- State: complete
- Mode: full
- Started: 2026-06-18
- Branch: codex/miniapp-tech-refactor
- Request: Absorb recent public AI/UI taste skill patterns into the repo-local mini app visual workflow while keeping BoChaos aligned to Tencent Cloud product-console quality.

## Acceptance Boundaries

- Functional: Strengthen `.agents/skills/bo-chaos-miniapp-visual-design/SKILL.md` with actionable design diagnosis, anti-template, interaction, image-slice, and evidence rules.
- Verification: Run `git diff --check` and `pnpm agent:lint`.
- Docs Sync: Update task record; update L2 docs only if repo-wide skill policy changes.
- Safety: Do not install third-party skills, copy external themes wholesale, or change app source behavior in this documentation pass.
- Archive: Move this record to `.agents/tasks/archive/` when complete.

## Actions

- Reviewed current mini app visual skill and `docs/agent/SKILLS.md`.
- Compared recent public UI taste skill patterns against the existing BoChaos visual direction.
- Added reference-board, anti-template, interaction taste, and image-slice rules to the mini app visual skill.

## Decisions and Assumptions

- Third-party taste skills are critique inputs only; the source of truth remains this repo's Tencent Cloud console direction.
- No source app files should change in this pass.

## Files Touched

- `.agents/skills/bo-chaos-miniapp-visual-design/SKILL.md`
- `.agents/tasks/active/2026-06-18-miniapp-visual-skill-taste-refresh.md`

## Verification Evidence

- `git diff --check` passed.
- `pnpm agent:lint` passed.
- Mini app build was not run because this pass changes agent skill documentation only, with no app runtime/source changes.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-06-18-miniapp-visual-skill-taste-refresh.md`
