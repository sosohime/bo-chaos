# OpenSpec

This directory keeps lightweight product and behavior specs for the repo. It is intentionally small: use it when a change affects product behavior, API contracts, data states, or cross-app workflows.

## Workflow

1. Read `openspec/project.md`.
2. Check relevant accepted specs under `openspec/specs/`.
3. For a meaningful new feature or behavior change, create `openspec/changes/<change-id>/proposal.md`.
4. Implement the change.
5. Update accepted specs when the behavior ships.
6. Run the verification commands listed in the proposal or spec.

## Change ID Style

Use short kebab-case names, for example:

- `photo-review-tabs`
- `waterfall-image-sizing`
- `kowtow-history-chart`

## Scope

OpenSpec is not a replacement for tests. A good change should usually have both:

- a short spec that names expected behavior;
- a test or verification command that catches regressions.
