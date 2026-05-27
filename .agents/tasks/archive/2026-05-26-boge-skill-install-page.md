# Task Record: Boge persona skill install page

- State: complete
- Mode: full
- Started: 2026-05-26
- Branch: codex/boge-persona-sampling-plan
- Request: Build a public page like Bo Codex pets so users can install and use the 博哥口语 persona skill in Codex and Claude Code, including enable/disable and global/project install guidance.

## Acceptance Boundaries

- Functional: Add a low-privacy skill package, install scripts, and an Astro public page with copyable install/use/remove commands.
- Verification: Build Astro, run agent lint, and inspect the generated page route.
- Docs Sync: Update repo agent docs only if durable workflow changes are introduced.
- Safety: Do not include raw private chat, real private names, group names, company-specific incidents, or context-bound insults in the public skill.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Actions

- Routed the request to `apps/frontend-astro` and a new static package under `packages/agent-skills`.
- Added `packages/agent-skills/skills/boge-oral-persona/SKILL.md`.
- Added macOS/Linux and Windows installer scripts for Codex, Claude Code, both, and project `.agents` targets.
- Added `/bo/boge-skill` Astro install page with copyable install/remove commands and enable/disable guidance.
- Added a Bo homepage entry linking to the skill install page.
- Updated the skill and page prompts to use natural trigger phrases such as `用博哥说`, `来点博哥味`, and `上点强度`.
- Added daily ritual / emoji texture including `必须必须了`, `[加油]`, `🫡`, and the private workday dread line.
- Reworked the install page hero from explanatory analysis copy into dialogue-style examples; replaced `[加油]` with `💪`; removed unnatural trigger/disable wording.
- Changed the skill and pet install pages from desktop side-by-side panels to top hero sections so the primary content is visible first on large browsers.
- Promoted "tell an agent what to install" prompt cards above manual shell commands on the skill page.
- Removed internal negative guidance from the public skill and simplified it into triggers, voice particles, sentence shapes, and examples.
- Reduced the install page's primary path to two copyable "tell the agent" prompts; moved shell commands and delete commands into backup details blocks.
- Removed leftover instruction-like trigger wording; kept natural triggers like `用博哥说`, `来点博哥味`, `上点强度`, and `博哥锐评一下`.

## Iteration Log

- Not using visual-fast-lane; this is a new static install page and package.

## Deferred Verification

- None.

## Decisions and Assumptions

- Treat `~/.codex/skills` as Codex user-scope install target.
- Treat `~/.claude/skills` as Claude Code user-scope install target.
- Treat `.agents/skills` as project/global repo-scope install target for agents that load repo-local skills.

## Files Touched

- `.agents/tasks/active/2026-05-26-boge-skill-install-page.md`
- `packages/agent-skills/skills/boge-oral-persona/SKILL.md`
- `packages/agent-skills/install-boge-oral-persona.sh`
- `packages/agent-skills/install-boge-oral-persona.ps1`
- `apps/frontend-astro/src/pages/bo/boge-skill.astro`
- `apps/frontend-astro/src/components/tuixiu/bo/index.astro`

## Verification Evidence

- `bash -n packages/agent-skills/install-boge-oral-persona.sh`: passed.
- `CODEX_HOME=/private/tmp/boge-skill-install-codex-test BASE_URL=file:///Users/heyesheng/Documents/code/github/bo-chaos/packages/agent-skills AGENT_TARGET=codex bash packages/agent-skills/install-boge-oral-persona.sh`: installed `SKILL.md`.
- `BASE_URL=file:///Users/heyesheng/Documents/code/github/bo-chaos/packages/agent-skills AGENT_TARGET=agents PROJECT_AGENTS_DIR=/private/tmp/boge-skill-install-agents-test/.agents/skills bash packages/agent-skills/install-boge-oral-persona.sh`: installed project `.agents` skill.
- `pnpm -C apps/frontend-astro build`: passed; generated `/bo/boge-skill/index.html`.
- `pnpm agent:lint`: passed with `agent-lint: ok`.
- Local dev server opened at `http://localhost:4322/bo/boge-skill`; page rendered install commands, enable/disable guidance, project install, and delete sections.
- Updated verification: `pnpm -C apps/frontend-astro build` and `pnpm agent:lint` passed again after copy/skill revisions.
- Updated verification: `pnpm -C apps/frontend-astro build` and `pnpm agent:lint` passed again after layout and install-flow revisions.
- Updated verification: public skill/page trigger scans found no leftover instruction-like trigger wording after cleanup.
- Updated verification: `pnpm -C apps/frontend-astro build` and `pnpm agent:lint` passed again before pushing to `main`.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-26-boge-skill-install-page.md`
