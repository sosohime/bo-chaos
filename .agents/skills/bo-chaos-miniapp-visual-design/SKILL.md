---
name: bo-chaos-miniapp-visual-design
description: Use when redesigning or polishing the bo-chaos Taro mini app UI, visual taste, tab bar states, photo feeds, retirement page, loading/empty/error states, or AI/tech styling direction.
---

# BoChaos Miniapp Visual Design

Use this after `bo-chaos-miniapp` when the work touches mini app visual direction.

## Direction

- Aim for a Tencent Cloud product-console feel: clean white surfaces, quiet blue actions, gray-blue data text, precise dividers, compact resource cards, and clear operational states.
- Add AI/tech feeling through information architecture, status chips, subtle grid/rule accents, restrained blue highlights, and state labels.
- Keep the app honest and usable. Do not create official-site, sales-page, fake SaaS dashboard, or generic AI-glow visuals.
- Prefer real product states over decorative imagery. Use generated bitmap assets only when they clarify a concrete screen, resource, or branded scene.
- Treat third-party UI taste skills as critique material, not as a visual theme. For BoChaos, adopt product-interface discipline from tools like Impeccable, anti-generic-AI checks from Taste Skill, and production UI quality gates from Addy Osmani-style frontend guidance.

## Product Taste Rules

- Design screens as a useful product surface first: resource hierarchy, current state, available action, and recovery path should be visible without marketing copy.
- Keep brand energy in small details: section labels, icon rhythm, selected states, data density, and motion restraint. Avoid a brand-site composition inside the mini app.
- Prefer fewer, stronger UI primitives: page shell, resource panel, list row, status chip, action button, and footer state. Do not multiply card styles for decoration.
- Use AI/tech language only when it maps to actual runtime behavior or data state. Do not invent scans, diagnostics, intelligence scores, or system claims.
- Make inactive states intentionally quiet and active states precise. Selection should not resize, jump, glow, or look like a campaign pill.

## Anti-Slop Checks

Before finishing a visual change, scan the touched screens for:

- Marketing hero sections, oversized slogans, fake metrics, fake diagnostics, or “官网截图感”.
- Lazy-loaded list counts derived from loaded items instead of backend totals.
- Tab bar active/inactive states that change size, jump, or use mismatched icon weights.
- Dark/purple neon, glow blobs, busy gradients, or decorative cards nested inside cards.
- Empty/loading/error states that look like placeholders instead of product resource states.
- Copy that exposes private employment detail, hard-codes retirement rules, or invents progress labels.

## Component Rules

- Photo feeds: keep true `Image lazyLoad`, stable card dimensions, visible loading/error/empty/footer states, and no eager image probes.
- Tab bar: keep icon/text rhythm stable; active state should feel selected without becoming a floating marketing pill.
- Retirement page: show canonical countdown/progress facts from shared constants only; avoid filler KPIs.
- UGC controls: honor runtime config and the single UGC kill switch across tabs, upload, history, and fetch behavior.
- Approval/upload states: present as queue/resource states with clear retry paths and no fake system claims.

## Verification

- Run `pnpm -C apps/miniapp-taro build:weapp` when feasible.
- Run `pnpm agent:lint` before finishing non-trivial UI work.
- Note whether WeChat DevTools visual verification was run; if unavailable, say so explicitly.
