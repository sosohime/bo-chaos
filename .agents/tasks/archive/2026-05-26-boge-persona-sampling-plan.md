# Task Record: Boge persona sample-collection plan

- State: complete
- Mode: full
- Started: 2026-05-26
- Branch: codex/boge-persona-sampling-plan
- Request: Create a project-compliant plan for collecting WeChat conversation samples and refining the Codex 博哥 persona.

## Acceptance Boundaries

- Functional: Land a concrete plan that explains how to collect representative WeChat-style samples without using a WeChat API or database extraction, then turn those samples into a safer fictional Codex persona.
- Verification: Run `pnpm agent:lint` and inspect the committed diff.
- Docs Sync: No L2 agent docs update expected unless the plan changes repo workflow, commands, routing, architecture, data model, or frontend/debug conventions.
- Safety: Avoid production writes, secrets, private raw chat content, WeChat database decryption, auth/security changes, deploys, and external writes.
- Archive: Move this record to `.agents/tasks/archive/` before final response.

## Plan: 博哥人格样本采集与迭代

### Goal

Build a privacy-aware local workflow for collecting representative chat snippets and using them to refine the existing Codex 博哥 persona plugin. The output should be a fictional style profile, not an impersonation of a real person.

### Collection Principles

- Collect representative samples, not full chat history. Target 50 high-signal snippets for v1 and 150-200 snippets for a stronger v2.
- Use only user-accessible chat content. Do not decrypt WeChat databases, bypass app protections, scrape private data from other devices, or ingest chats without appropriate consent.
- Keep all raw samples local until they are sanitized. Raw logs should not be committed to this repo.
- Preserve enough context for style analysis: 2-5 turns around each target message, plus scenario and intensity tags.

### Sample Schema

Use a local file outside the repo, such as `/private/tmp/boge-samples.md`, with this shape:

```md
## 场景：debug 卡住

我：这个问题偶现，没找到路径
博哥：别急头白脸，先把输入收敛一下。偶现不搞成必现，后面都是吭哧瘪肚。

标签：

- 场景：debug
- 强度：中
- 特点：先压住情绪，再要求最小复现
```

Required tags:

- `场景`: debug, review, planning, delivery pressure, casual, frustration, report polish, or other short label.
- `强度`: low, medium, high.
- `特点`: one short note about why the line is representative.
- `脱敏状态`: raw-local, sanitized, or rejected.

### Collection Channels

1. Manual WeChat desktop search and copy-paste.

   - Search for known vocabulary such as `急头白脸`, `吭哧瘪肚`, `几把`, `dssb`, `先别`, `别扯`, `你这个`, and other user-supplied phrases.
   - Copy only the useful local context into the local sample file.

2. Screenshot plus OCR for messages that are hard to copy.

   - Use OCR only for selected snippets.
   - Review OCR output manually before analysis.

3. Optional local UI automation if manual collection is too slow.
   - Automation may simulate visible scrolling, selection, copy, and append-to-file behavior.
   - It must not read or decrypt WeChat databases directly.
   - It should keep a review queue so the user approves snippets before analysis.

### Sanitization

- Replace real names, group names, project names, customer names, IDs, links, phone numbers, and internal system names with stable placeholders such as `同事A`, `项目X`, `群Y`, and `链接Z`.
- Drop samples that contain credentials, secrets, unreleased business information, sensitive personal details, or anything the user cannot safely share with Codex.
- Keep exact private quotes out of the final plugin whenever possible; convert them into generalized style rules and synthetic examples.

### Persona Synthesis

Analyze sanitized samples into:

- Vocabulary: recurring words, short phrases, and filler expressions.
- Sentence shape: average length, imperative patterns, rhetorical questions, and transition phrases.
- Interaction rules: how the persona behaves when the user is stuck, wrong, frustrated, vague, or asking for formal output.
- Intensity levels: off, light, normal, and high, with default `off` for global context and explicit `/boge-on` for activation.
- Suppression rules: formal reports, PR/MR text, legal/security copy, customer-facing writing, and leadership-ready documents should automatically reduce the style to near zero unless explicitly requested.

### Plugin Update Plan

When sanitized samples are ready:

1. Update the source persona plugin under the personal plugin path.
2. Refine `skills/chaos-colleague-persona/SKILL.md` with sample-derived style rules and boundaries.
3. Keep `/boge-on`, `/boge-off`, and `/boge-status` stable.
4. Reinstall or refresh the personal plugin cache if command or skill files changed.
5. Verify `codex-persona status` and the installed plugin state.

### Validation Matrix

Run sample prompts before accepting the refined persona:

- Debug stuck: ask for a reproducible path from an intermittent bug.
- Code review: ask for risks first, then concise summary.
- Formal report: verify the persona turns down to near zero.
- User frustration: verify it does not insult the user or escalate emotion.
- Casual chat: verify the persona can be more visible without becoming noisy.

Acceptance for v1:

- The persona uses sample-derived patterns without quoting sensitive raw chat.
- It remains technically useful and concise.
- It does not impersonate a real person.
- It can be enabled and disabled through the existing slash commands and `codex-persona` shell shortcut.

## Actions

- Created a fresh branch from `origin/main`.
- Read agent routing, workflow, commands, quality, doc-sync guidance, and relevant prior Codex persona rollout memory.
- Wrote this task record as the project-local plan artifact.
- Ran the required agent harness lint.

## Iteration Log

- Not using visual-fast-lane; this is a full documentation/workflow task.

## Deferred Verification

- None.

## Decisions and Assumptions

- This request routes to repo agent workflow documentation rather than a product app package.
- The plan subject is the current Codex 博哥 persona and WeChat sample-collection workflow from the preceding conversation.
- No L2 agent docs update is required because this creates a task-specific plan and does not change durable repo workflow, commands, routing, architecture, data model, or frontend/debug conventions.
- Raw WeChat samples must remain outside the repo and should not be committed.

## Files Touched

- `.agents/tasks/archive/2026-05-26-boge-persona-sampling-plan.md`

## Verification Evidence

- `pnpm agent:lint`: initial attempt failed because `pnpm` was not on this non-interactive shell PATH.
- `/Users/heyesheng/.nvm/versions/node/v22.14.0/bin/pnpm --version`: `9.15.4`.
- `/Users/heyesheng/.nvm/versions/node/v22.14.0/bin/pnpm agent:lint`: passed with `agent-lint: ok`.
- `/Users/heyesheng/.nvm/versions/node/v22.14.0/bin/pnpm agent:lint`: re-run after archive update passed with `agent-lint: ok`.

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-05-26-boge-persona-sampling-plan.md`
