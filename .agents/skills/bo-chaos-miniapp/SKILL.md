---
name: bo-chaos-miniapp
description: Use when changing the bo-chaos Taro mini app pages, request helpers, WeChat login flow, photo UI, kowtow page, upload flow, or mini app styles.
---

# bo-chaos Miniapp

Use this for `apps/miniapp-taro`.

## Context

Read:

- `docs/agent/ROUTING.md`
- `docs/agent/CONVENTIONS.md`
- `docs/agent/QUALITY.md`
- `docs/agent/DATA_MODEL.md` when API data shapes are involved

## Workflow

1. Locate the page under `src/pages/` and the API wrapper under `src/api/`.
2. Use the `http` helper from `src/lib/request.ts` for API calls.
3. Preserve the JWT retry/login behavior.
4. Keep page config, TSX, and SCSS changes together when changing a page.
5. Do not casually change production `BASE_URL`.
6. Note when WeChat devtools verification is required but unavailable.

## Verification

- Build with `pnpm -C apps/miniapp-taro build:weapp` when feasible.
- Search for affected API consumers when changing response shapes.
- Run `pnpm agent:lint` before finishing.
