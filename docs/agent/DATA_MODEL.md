# Agent Data Model

Source of truth: `packages/prisma-client/prisma/schema.prisma`. Update this file when Prisma models or important enum-like strings change.

## User

Represents a WeChat mini app user.

- Primary key: `id`
- Stable external identity: `openId` unique
- Auth/session fields: `sessionKey`
- Profile fields: `nickname`, `avatarUrl`
- Review capability: `photoReviewer`
- Relations: daily behavior, photos, votes, authored categories

## UserDailyBehavior

Daily per-user kowtow counters.

- Composite id: `openId`, `date`
- Tracks `kowtowCount`, first and last kowtow timestamps.
- Date is stored as `@db.Date`.

## GlobalDailyStats

Global daily kowtow aggregate.

- Primary key: `date`
- Tracks `totalKowtows`.

## PhotoCategory

Photo grouping used by history/travel/tease systems and review flow.

- Primary key: `id`
- Fields: `system`, `systemName`, `name`
- Optional author by `authorOpenId`
- Unique pair: `system`, `name`
- Relations: photos

Known `system` enum values map to `history`, `travel`, and `tease`.

## Photo

Uploaded image/content item.

- Primary key: `id`
- File identity: `filename`
- User-facing fields: `name`, `description`
- Engagement: `viewedTimes`, votes relation
- Category: required `categoryId`
- Status: `PhotoStatus` enum default `reviewing`
- Optional author by `authorOpenId`

Known photo statuses are `reviewing`, `passed`, and `rejected`.

## PhotoVote

User vote on a photo.

- Primary key: `id`
- Unique pair: `photoId`, `userOpenId`
- Updated timestamp: `updatedAt`
- Relations: photo and user

## Data Model Rules

- If a Prisma model changes, update this file in the same change.
- If a response shape changes, update affected frontend API wrappers.
- Treat string statuses and systems as API contracts even when the database stores them as strings.

## Group notebook

The GroupRank migrations create independent app-scoped identities, group spaces and memberships, board rule snapshots, score revisions, draft rules, proxy claims, reports, themes and backgrounds. GroupRank records do not reuse BoFans users or scores. The accepted contract is in `openspec/specs/group-ranking/spec.md`.

`GroupRankBoard.updatedAt` starts at creation and is advanced in the same transaction as a score or recommendation mutation, proxy entry or claim, or an appearance or status change. Read requests, reports, and idempotent retries leave it alone. The migration backfills it from creation, retained score revisions and proxy activity, and existing recommendation timestamps. The directory sorts by `updatedAt`, `createdAt`, then board ID, all descending.

Recommendation boards use `templateSnapshot.kind = "recommendation"`. `GroupRankRecommendationItem` stores the first approved display name and a normalized key unique within its board. `GroupRankRecommendation` has one row per item and user. Writes serialize on the board row to enforce five active recommendations per member. Withdrawal deletes that member's recommendation, and zero-vote items are omitted from board detail. Legacy score boards have no `kind` field.

`GroupRankRecommendation.note` is nullable and holds one optional moderated usage note of at most 120 characters. It can be submitted with the vote or filled and edited later by the vote owner on an open board. Editing preserves the vote's `createdAt`, counts and rank. Repeated vote submissions preserve the original note. A withdrawal removes the vote and note. A nonempty `recommenders[].note` is returned through the verified group board detail only.

The verified current-group response includes an optional `recommendationSummary` for each recommendation board. It contains active vote count, active votes cast today in Asia/Shanghai, the first model ordered by votes descending and item ID ascending, and the number of models tied for first. Empty boards return zero counts and a null leader. The summary contains no recommender identities.
