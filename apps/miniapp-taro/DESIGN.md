# BoChaos Miniapp Design Memory

This file is the miniapp visual contract for agents. Use it with `.agents/skills/bo-chaos-miniapp-visual-design/SKILL.md` before redesigning pages, tabs, loading states, image feeds, or action panels.

## Product Direction

BoChaos miniapp should feel like a compact Tencent Cloud-style product console adapted to WeChat: quiet, precise, data-honest, and operational. The AI/tech feeling should come from state hierarchy, crisp controls, and disciplined information design, not from decorative effects.

The app should not look like a startup landing page, a generated concept shot, a mock SaaS dashboard, or an official-site promotion page.

## Reference Translation

Use public AI UI taste skills as review tools only:

- Taste Skill-style checks help reject generic AI UI, fake dashboards, inflated copy, and decorative effects.
- Anthropic frontend-design-style checks help force a concrete visual direction before editing.
- DESIGN.md-style memory keeps later agents from reinventing the visual language page by page.

Do not copy outside visual themes into BoChaos. Translate their critique questions into the Tencent Cloud console fit below.

## Visual System

- Surfaces: use white or near-white panels, thin borders, compact dividers, and restrained spacing.
- Accent: use quiet Tencent-like blue for primary action and selected state. Keep inactive state gray-blue and stable.
- Density: prefer resource rows, command lists, section headers, and state chips over stacked decorative cards.
- Type: use small, clear product labels. Avoid oversized slogans inside app pages.
- Motion: only animate real loading, upload progress, countdown progress, or user-triggered transitions.
- Images: real photo content should dominate photo pages. Generated slices are allowed only for functional empty states or small branded textures after the native hierarchy already works.

## Interaction Rules

- First viewport should show the current state and the next useful action, not a banner.
- Every button should use a concrete verb and have an obvious result.
- Tab active and inactive states must keep stable size, rhythm, and icon weight.
- Lazy-loaded lists must append content without changing tab labels, section totals, selected states, or footer position unexpectedly.
- Empty, loading, error, retry, disabled, uploading, and submitted states should reuse the same product surface language.

## Data Honesty

Every number, badge, total, progress label, and status must come from one of these sources:

- backend API data,
- runtime config,
- shared constants,
- visible local queue state.

If a value is unavailable, show loading, unknown, empty, or hidden state. Do not estimate totals from currently rendered lazy-loaded items.

## Page Notes

- Photo feeds: keep true `Image lazyLoad`, stable media boxes, real totals from API meta, and designed footer/error states.
- Retirement page: use shared retirement constants and current countdown state only. Do not hard-code employment rules or private explanatory claims in UI copy.
- UGC controls: the runtime kill switch must hide UGC entry points consistently across tabs, upload, history, and fetch behavior.
- Approval and upload: present as queue/resource states with clear retry and submit paths.
- Kowtow and account pages: keep stats, identity, and actions compact; avoid ornamental metrics.

## Anti-Slop Rejection List

Reject or remove:

- marketing heroes, campaign banners, oversized slogans, and official-site compositions,
- fake AI scans, fake diagnostics, fake intelligence scores, and unverifiable system claims,
- purple/neon/dark glow styling, decorative blobs, heavy gradients, and busy tech overlays,
- cards nested inside cards or every section turned into a floating card,
- tab states that jump, resize, or look like disconnected pills,
- copy that exposes private employment detail or hard-codes retirement rules,
- image slices that compensate for weak layout or simulate product credibility.

## Review Questions

Before accepting a miniapp visual change, answer these in the task record:

- What is the screen job?
- What state or action must be understood first?
- Which data source proves each number or status?
- Which visual primitive was removed or simplified?
- Does the screen feel closer to a product console than a landing page?
- Would the bottom tab area still look deliberate when cropped alone?
