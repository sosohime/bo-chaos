# Agent Skills Policy

This repo uses third-party skills as source material, but the operating contract is the repo-local harness.

## Directly Adopted Principles

- `karpathy-guidelines`: behavior baseline for assumptions, simplicity, surgical edits, and verification.
- Addy Osmani `context-engineering`: progressive context loading and L1/L2/L3 separation.
- Addy Osmani `source-driven-development`: check official docs for framework/version-specific implementation details.
- Addy Osmani `frontend-ui-engineering`: production UI quality, accessibility, and avoiding generic AI UI.
- Addy Osmani `api-and-interface-design`: stable API contracts, boundary validation, additive changes.
- Addy Osmani `security-and-hardening`: auth, upload, external API, user input, and secret handling guardrails.
- Addy Osmani `debugging-and-error-recovery`: reproduce, localize, reduce, fix, and guard.
- Addy Osmani `code-review-and-quality`: review before finishing non-trivial work.
- Impeccable-style product/brand separation: product screens should prioritize operational clarity, state, density, and recovery paths over campaign-page polish.
- Taste Skill-style anti-slop critique: use third-party taste packs to catch generic AI UI, fake metrics, theme drift, and overdecorated layouts, not to overwrite this repo's product direction.

## Tool Skills to Use Selectively

- Composio `webapp-testing`: use as inspiration for Browser Use / Playwright local web app verification.
- Composio `gh-fix-ci`: use after this repo has GitHub Actions or a PR with failing checks.
- Composio `codebase-migrate`: use for large, batched migrations or multi-file refactors.
- Composio `mcp-builder`: use only if this repo later builds a custom MCP server.

## Not Adopted Wholesale

- Do not install all Addy skills by default. The full lifecycle pack is useful but too broad for this repo's L1 context.
- Do not install all Composio skills by default. Many require external accounts or Composio CLI setup.
- Do not install random OpenClaw/ClawHub skills. Treat marketplace skills as untrusted until reviewed.

## Repo-Local Skills

Repo-local playbooks live in `.agents/skills/`:

- `bo-chaos-task-routing`: map a request to the right app/package.
- `bo-chaos-backend`: Nest + Prisma backend workflow.
- `bo-chaos-admin-frontend`: Next admin UI workflow and browser debug.
- `bo-chaos-miniapp`: Taro mini app workflow.
- `bo-chaos-miniapp-visual-design`: mini app visual taste, Tencent Cloud console styling, AI/tech polish, and anti-slop checks.
- `bo-chaos-doc-sync`: keep agent docs aligned with code.

These skills should point back to `docs/agent/` instead of duplicating all context.

## Workflow Discipline

- Use `docs/agent/WORKFLOW.md` for action records, acceptance boundaries, and archive rules.
- Use `.agents/templates/task-record.md` for the per-task record shape.
- Do not rely on chat history as the only audit trail for non-trivial work.
