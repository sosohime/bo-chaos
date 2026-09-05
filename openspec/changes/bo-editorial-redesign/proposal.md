# Bo editorial redesign

## Intent

Turn the public news list and retirement counter into a cohesive, source-backed publication and companion countdown. Keep current URLs and facts, add useful navigation and reading behavior, and remove artificial waiting from sharing.

## Scenarios

- Readers can search and filter all news records; the URL retains the query and category and works after reload/back/forward. Without JavaScript, all content and source links remain readable.
- Person-specific curated records have stable detail URLs, citations, known source dates and related reading. Product-page observations are identified as such and link to their source; no product update is automatically attributed to Yuanbo personally.
- RSS, sitemap, canonical tags and structured data share the same record model. Undated sources do not acquire a fabricated publication date.
- News, retirement, profile and detail pages use one responsive shell and accessible system/light/dark themes.
- Retirement uses shared start/target constants, clamps past-target values to zero, updates once per second, and stops timers when hidden. Copy completes without artificial AI delays and exposes a recoverable failure state. Focus mode exits via its control or Escape.

## Verification

Run data/countdown boundary tests, pnpm run build:astro, generated HTML/RSS/link checks, local browser checks at desktop and mobile widths and in both color themes, then pnpm agent:lint.
