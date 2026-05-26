# BoFans Core Spec

## Purpose

BoFans connects the miniapp, backend, admin console, and shared Prisma model around user-generated photo materials and lightweight user interactions.

## Current Behavior

### Photo Review

- Photos can be in review-related states including reviewing, passed, and rejected.
- Admin workflows may update photo category and review status.
- User-facing miniapp views should not show content that is not allowed for the current publishing mode.

### Publish Review Mode

- `BOFANS_WEAPP_PUBLISH_STATUS=normal` means normal public behavior.
- `BOFANS_WEAPP_PUBLISH_STATUS=in_review` means miniapp-facing APIs may return review-safe data or hide normal content.
- Backend global state exposes whether the miniapp is in review mode.

### Photo Dimensions

- Uploaded photo filenames may include image dimensions.
- Clients can use stored or encoded dimensions to compute waterfall layout height before the image fully loads.

### Kowtow

- User kowtow actions are tracked by day.
- Global daily kowtow statistics are tracked separately from per-user daily behavior.

## Verification

Run:

```sh
pnpm run test:ci
pnpm run build:backend
```

For miniapp-visible behavior changes, also run the relevant Taro build or manual miniapp verification.
