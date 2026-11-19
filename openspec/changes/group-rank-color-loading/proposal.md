# Independent board palette and visible async feedback

User confirmed2026-11-16: whole-board color scheme, independent of background photo. Independent production backend and sixth additive color migration deployed2026-11-17 as `20261117-color-79d6f94f9693-r2`. Restored-database and live rollback-transaction round trips passed. Current package physical validation remains pending; do not infer it from backend tests.

## Contract
- Optional accentColor is a canonical six-digit uppercase hex color, null follows the selected material theme. Backend owns validation/persistence; creator-only current-group mutation remains unchanged. Draft identity includes color; activation copies color into a separate nullable Board column, not mutable rules. No existing score, background asset or crop changes when only color changes.
- Seven curated colors plus hue/brightness selection. Shared palette owner provides automatic button/icon ink and readable same-hue accents on dark surfaces. PageFrame supplies palette to root-portal sheets; preview/catalog/detail use the same owner. Creation starts with one compact color row, expands on demand.
- Shared ActionButton shows real operation stages and prevents duplicate taps. First reads use geometry-reserving skeletons; background/avatar reads show subtle pending feedback. Write failure retains input/local color/photo and a retry; private ranking still clears if authoritative refresh fails. Do not invent percentages or make a failed save appear applied.
- Source320/375/430, native simulator key paths, async/adversarial tests and temporary PostgreSQL round trips are separate evidence; none implies new physical-device acceptance.

## Deployment boundary
Additive migration20261116000000_group_rank_color; back up/restore-check only isolated GroupRank DB, stage complete backend on current background baseline, regenerate Prisma on Linux and smoke before independent-service switch. No auth/CORS/gateway/BoFans changes. Keep column/data on code rollback. Deploy server first, then create ordinary preview QR; never upload synthetic native QA package.
