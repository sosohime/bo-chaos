# Project Context

`bo-chaos` is a pnpm monorepo containing several Bo-related products:

- BoFans miniapp for user interactions, photo browsing, uploads, kowtow actions, travel/history/tease pages, and profile views.
- NestJS backend for auth, users, photos, categories, upload integration, global flags, and kowtow statistics.
- Next.js admin console for login, review, and content management.
- Astro public retirement countdown pages.
- VSCode extension for retirement countdown status.

## Domain Notes

- Photo materials move through review states such as reviewing, passed, and rejected.
- The miniapp can run in a publish review mode controlled by `BOFANS_WEAPP_PUBLISH_STATUS`.
- Photos may include dimensions in filenames so clients can render masonry/waterfall layouts without waiting for image probing.
- Shared constants and utilities live in packages and should remain app-agnostic.

## Engineering Priorities

- Keep API behavior explicit because miniapp, admin, and backend are coupled.
- Prefer service-level tests for backend business rules.
- Prefer shared utility tests for parsing, date, filename, and layout helpers.
- Keep generated Prisma client behavior in `packages/prisma-client`; do not hand-edit generated output.
- Add specs before implementing cross-app behavior changes.

## Default Verification

Run:

```sh
pnpm run verify
```

If a touched app is not covered by default verification, run its app-level command and record the result in the change notes.
