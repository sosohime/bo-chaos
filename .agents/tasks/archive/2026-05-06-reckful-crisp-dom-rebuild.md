# Task Record: Reckful responsive open-world rebuild

- State: active
- Mode: full
- Started: 2026-05-06
- Branch: main
- Request: Rebuild `/reckful` from a fixed-card mockup into a responsive open-world progress page with crisp raster assets and DOM UI.

## Acceptance Boundaries

- Replace low-resolution full-page cutout rendering with crisp DOM UI over a generated high-resolution map background.
- Use a real raster companion image instead of CSS-built creature shapes.
- PC `1434x700`, `1440x1100`, and `1100x650` must use a responsive wide map stage, not a narrow fixed card.
- Mobile `390x1100` must use a separate single-column structure without horizontal overflow or module order breakage.
- Keep the live countdown, welfare CTA, and return link functional; keep CTA target `https://rocom.qq.com/cp/a20260303welfare/`.
- Preserve the open-world / Roco-like visual direction without adding concrete personal job/company/team copy.
- Verify desktop, exact `1434x700`, narrow desktop, and mobile with the headed visual harness; use Browser Use if exposed, otherwise record fallback.
- Run Astro build and `pnpm agent:lint` before final.

## Actions

- Confirmed the cutout source images were inherently low-resolution and 4x upscaling could not restore detail.
- Generated and saved `open-world-hero-v2.png` as the production hero background.
- Generated and chroma-key processed `companion-v2.png` as the production companion raster image.
- Rewrote `apps/frontend-astro/src/components/tuixiu/reckful/index.astro` as a responsive full-width desktop map stage plus mobile single-column information flow.
- Updated `scripts/visual-reckful.mjs` to assert responsive desktop width, `1434x700` first-viewport fit, and mobile module order.

## Verification Evidence

- `pnpm -C apps/frontend-astro build`: passed. Sentry auth-token warnings only.
- `pnpm visual:reckful`: passed for `mobile-390`, `desktop-edge-900`, `desktop-retina-1024`, `desktop-1100`, `desktop-retina-1100`, `desktop-retina-1434`, `desktop-retina-1434x700`, and `desktop-1440`; no console messages in the final run.
- Latest visual summary: `/private/tmp/bo-chaos-visual/reckful/2026-05-06T08-06-01-920Z/summary.json`.
- `pnpm agent:lint`: exit 0; warning only for existing AGENTS.md/docs sync check.
- Browser Use attempted via tool discovery; Node REPL browser execution tool was not exposed in this session, so headed Chrome visual harness was used as fallback.

## Handoff / Archive Notes

- Final state: completed
- Archive path: `.agents/tasks/archive/2026-05-06-reckful-crisp-dom-rebuild.md`
