---
name: bo-chaos-admin-frontend
description: Use when changing the bo-chaos Next.js admin app, review UI, admin API wrappers, shadcn-style components, browser behavior, or local frontend debugging.
---

# bo-chaos Admin Frontend

Use this for `apps/front-next-admin`.

## Context

Read:

- `docs/agent/ROUTING.md`
- `docs/agent/CONVENTIONS.md`
- `docs/agent/FRONTEND_DEBUG.md`
- `docs/agent/QUALITY.md`

## Workflow

1. Start with the relevant page under `src/app/` and API wrapper under `src/api/bofans/`.
2. Use existing UI primitives from `src/components/ui/`.
3. Keep client state local unless the existing page already uses a broader pattern.
4. Include loading, empty, and error handling when changing data UI.
5. Do not execute admin write actions against production `yuanbo.online` from local browser testing.
6. Use Browser Use for visual/runtime checks when feasible; use Playwright only for repeatable regression checks.

## Verification

- Build with `pnpm -C apps/front-next-admin build` when feasible.
- For runtime UI changes, verify with Browser Use or document why it was not run.
- Run `pnpm agent:lint` before finishing.
