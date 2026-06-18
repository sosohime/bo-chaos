---
name: bo-chaos-miniapp-visual-design
description: Use when redesigning or polishing the bo-chaos Taro mini app UI, visual taste, tab bar states, photo feeds, retirement page, loading/empty/error states, or AI/tech styling direction.
---

# BoChaos Miniapp Visual Design

Use this after `bo-chaos-miniapp` when the work touches mini app visual direction.

Before editing mini app visuals, read `apps/miniapp-taro/DESIGN.md`. Treat it as the project-local design memory; this skill explains the workflow and review gates around that contract.

## Direction

- Aim for a Tencent Cloud product-console feel: clean white surfaces, quiet blue actions, gray-blue data text, precise dividers, compact resource cards, and clear operational states.
- Add AI/tech feeling through information architecture, status chips, subtle grid/rule accents, restrained blue highlights, and state labels.
- Keep the app honest and usable. Do not create official-site, sales-page, fake SaaS dashboard, or generic AI-glow visuals.
- Prefer real product states over decorative imagery. Use generated bitmap assets only when they clarify a concrete screen, resource, or branded scene.
- Treat third-party UI taste skills as critique material, not as a visual theme. For BoChaos, adopt product-interface discipline from tools like Impeccable, anti-generic-AI checks from Taste Skill, and production UI quality gates from Addy Osmani-style frontend guidance.

## External Taste References

Use current public AI UI skill patterns as review input, then translate them into the BoChaos product-console language.

- Anthropic-style frontend design: pick a concrete aesthetic direction before editing, then make typography, spacing, color, and hierarchy decisions that support that direction.
- Taste Skill-style critique: actively reject generic AI output such as decorative glow, fake dashboards, over-carded layouts, and inflated copy.
- UI Design Brain-style components: treat tabs, lists, empty states, upload controls, galleries, and error states as reusable product patterns with expected behavior.
- DESIGN.md-style brand memory: keep BoChaos rules explicit enough that later agents preserve the Tencent Cloud console fit instead of reinventing the visual language.
- Engineering-style frontend guidance: every visual flourish must survive accessibility, performance, responsive layout, data truthfulness, and maintainability checks.
- Reference-board discipline: use Tencent Cloud product-console surfaces, real mini app constraints, and existing BoChaos product states as the reference board before choosing colors or effects.
- Anti-template discipline: if a screen could be mistaken for a SaaS landing page, a generic AI prompt result, or a design marketplace preview, remove the showpiece element and rebuild the state hierarchy.

Do not copy third-party visual themes into the app. Borrow their questions and quality gates only.

## Project Design Memory

`apps/miniapp-taro/DESIGN.md` is authoritative for miniapp visual direction:

- Use it before redesigning pages, tab states, loading/empty/error states, photo feeds, upload flows, approval queues, retirement UI, or generated image slices.
- If a screen-level decision conflicts with generic outside taste guidance, follow the BoChaos design memory and record the reason in the task record.
- If repeated visual work reveals a new durable rule, update `DESIGN.md` instead of burying the rule in chat history.

## Taste Gate

Run this gate before accepting any mini app visual change:

- Reference fit: the screen should feel closer to Tencent Cloud's compact product console than to a startup landing page, template gallery, or AI concept shot.
- Truthfulness: every number, progress label, badge, and tab count must come from API data, runtime config, shared constants, or visible local queue state.
- Density discipline: use compact rows, thin dividers, and quiet labels before adding a new card, illustration, texture, or badge.
- Interaction clarity: each first-screen action should answer "what happens if I tap this" without explanatory marketing copy.
- Mobile credibility: active/inactive tab states, tap targets, sticky controls, upload controls, list footer states, and lazy images must stay stable while scrolling and loading.
- Visual restraint: if a choice reads as "AI generated", remove it unless it directly helps a user identify state, take action, or recover from an error.

## Product Taste Rules

- Design screens as a useful product surface first: resource hierarchy, current state, available action, and recovery path should be visible without marketing copy.
- Keep brand energy in small details: section labels, icon rhythm, selected states, data density, and motion restraint. Avoid a brand-site composition inside the mini app.
- Prefer fewer, stronger UI primitives: page shell, resource panel, list row, status chip, action button, and footer state. Do not multiply card styles for decoration.
- Use AI/tech language only when it maps to actual runtime behavior or data state. Do not invent scans, diagnostics, intelligence scores, or system claims.
- Make inactive states intentionally quiet and active states precise. Selection should not resize, jump, glow, or look like a campaign pill.
- Use real mini app constraints as part of taste: thumb reach, scroll rhythm, tap targets, image load behavior, skeleton/empty/error recovery, and stable bottom navigation matter more than decorative novelty.
- When a screen feels cheap, remove one visual idea before adding another. The preferred fix is often clearer spacing, stronger hierarchy, or quieter copy.
- Prefer solid console surfaces and borders over translucent overlays. Transparency is allowed only for canvas animation or true media overlay needs, not as a default way to make controls look "tech".

## Tencent Cloud Console Fit

Use Tencent Cloud as a product-console reference, not as a brand clone.

- Page structure: lead with the user's current resource state, then the primary action, then secondary lists or history. Avoid first-screen campaign banners.
- Surface style: prefer white or near-white panels over colored blocks; use thin dividers, compact rows, and calm gray-blue labels for hierarchy.
- Action language: primary buttons should be operational and concrete. Avoid inflated labels such as "AI engine", "smart cockpit", "insight center", or "digital twin" unless a real feature supports them.
- Icons: use restrained line-style icons with consistent visual weight. Active tab icons may be filled or accented, but inactive icons should remain legible and quiet.
- Motion and effects: keep animation short and purposeful. Avoid glow, breathing halos, rotating grids, excessive blur, or decorative tech overlays.
- Data honesty: show only backend-provided counts and canonical shared constants. If data is unknown, show an explicit unknown/loading/empty state rather than a guessed metric.

## Screen Design Process

Before changing a page, write or mentally establish:

- Screen job: what the user is trying to decide or do.
- Primary state: the one fact or action that should be understood above the fold.
- Source of truth: which API response, runtime config, shared constant, or local queue state drives each number and label.
- Primitive set: which existing panel, row, chip, button, tab, or image pattern should be reused.
- Removal target: which stale, noisy, fake, or overly decorative element should disappear.

After changing a page, compare it against a Tencent Cloud console mental screenshot: white surfaces, crisp dividers, restrained blue, quiet metadata, and stable operational controls. If it reads like a landing page or a generated concept mockup, revise again.

## Taste-Skill Review Loop

Before editing a screen, run a short design diagnosis in the task record:

- What job does this screen do for the user?
- What is the single most important state or action above the fold?
- Which existing element currently looks cheap, fake, noisy, or inconsistent?
- Which copy, count, chip, or progress indicator might be unverifiable?
- Which visual primitive should be removed instead of polished?
- Which Tencent Cloud console pattern is the closest product reference: resource list, status summary, action footer, empty resource, detail drawer, or upload queue?
- Which part of the screen is allowed to feel "AI/tech", and what real state or interaction justifies it?

After editing, re-check the screen as a skeptical reviewer:

- Would this pass as a real product interface if the brand name were removed?
- Are there any "AI decoration" elements that do not improve a decision or action?
- Does the tab bar keep stable size, rhythm, and contrast between active and inactive states?
- Are all list, loading, empty, error, and footer states visually designed rather than left as text scraps?
- Can every number or status on the screen be traced to API data, runtime config, or shared constants?
- Would a user know the result of each tap without reading explanatory feature copy?
- Does the screen still look deliberate when screenshots are cropped to the first viewport and bottom tab area?

## Interaction Taste Rules

- Put the highest-frequency action in the easiest reach zone and make secondary actions quieter, not equally loud.
- Avoid mystery controls. Icon-only actions need established visual meaning; text actions need concrete verbs.
- Loading, empty, error, retry, disabled, uploading, and submitted states should reuse the same product surface instead of swapping into unrelated decorative layouts.
- Keep paginated surfaces honest: append new content without changing tab labels, section totals, selected states, or footer position unexpectedly.
- Make destructive or dismiss actions precise and quiet. They should be findable without visually competing with submit, retry, or navigation actions.
- Do not use motion, progress bars, or animated lines unless they represent real loading, upload progress, countdown progress, or a user-triggered transition.

## Anti-Slop Checks

Before finishing a visual change, scan the touched screens for:

- Marketing hero sections, oversized slogans, fake metrics, fake diagnostics, or “官网截图感”.
- Lazy-loaded list counts derived from loaded items instead of backend totals.
- Tab bar active/inactive states that change size, jump, or use mismatched icon weights.
- Dark/purple neon, glow blobs, busy gradients, or decorative cards nested inside cards.
- Empty/loading/error states that look like placeholders instead of product resource states.
- Copy that exposes private employment detail, hard-codes retirement rules, or invents progress labels.
- Mixed visual systems, such as legacy blue-white cards sitting beside new console panels.
- Decorative image slices that make the app look like a sales mockup instead of a usable mini app.

## Component Rules

- Photo feeds: keep true `Image lazyLoad`, stable card dimensions, visible loading/error/empty/footer states, and no eager image probes.
- Tab bar: keep icon/text rhythm stable; active state should feel selected without becoming a floating marketing pill.
- Retirement page: show canonical countdown/progress facts from shared constants only; avoid filler KPIs.
- UGC controls: honor runtime config and the single UGC kill switch across tabs, upload, history, and fetch behavior.
- Approval/upload states: present as queue/resource states with clear retry paths and no fake system claims.
- Generated bitmap slices: use them only for concrete branded texture or empty-state art. Never use them to simulate product credibility, hide poor layout, or replace real UI hierarchy.

## Image Slice Rules

- Use generated bitmap slices only after the native layout hierarchy is already credible.
- Prefer small, functional assets: empty-state illustration, branded texture behind a real resource state, or page-specific icon art.
- Do not use image slices for fake dashboards, fake diagnostics, artificial depth, large hero banners, or screenshot-like marketing panels.
- Keep generated assets below the interaction layer. They must not obscure tappable controls, loading states, photo content, counts, or retirement facts.
- Record why an image asset is needed in the task record; if the answer is "more tech", revise the native UI instead.

## Visual Evidence

- Prefer WeChat DevTools or real-device screenshots for final acceptance of broad UI work.
- If DevTools is unavailable, record the exact blocker in the task record and rely on build output, source inspection, and style scans only as partial evidence.
- Screenshots should be judged against the product-taste rules above, not merely checked for nonblank rendering.

## Verification

- Run `pnpm -C apps/miniapp-taro build:weapp` when feasible.
- Run `pnpm agent:lint` before finishing non-trivial UI work.
- Note whether WeChat DevTools visual verification was run; if unavailable, say so explicitly.
