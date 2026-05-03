---
name: bo-chaos-task-routing
description: Use when receiving a bo-chaos coding request to locate the right app/package before broad search. Routes work across Nest backend, Next admin, Taro mini app, Astro, VS Code extension, Prisma, and shared packages.
---

# bo-chaos Task Routing

Use this before editing when the target area is not already obvious.

## Workflow

1. Read `AGENTS.md`.
2. Read `docs/agent/ROUTING.md`.
3. Pick one primary app/package and at most two secondary areas.
4. Search inside those areas first with `rg`.
5. If the request crosses API boundaries, inspect both caller and server endpoint.
6. Record the routing assumption in your working notes or final response.

## Verification

- The selected files map to a row in `docs/agent/ROUTING.md`.
- You did not run a broad repo scan before narrowing the area.
- If routing was ambiguous, you stated the assumption or asked only when the risk was high.
