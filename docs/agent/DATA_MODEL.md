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

## Category

Photo grouping used by history/travel/tease systems and review flow.

- Primary key: `id`
- Fields: `system`, `name`, `secondCategory`
- Optional author by `authorOpenId`
- Unique pair: `name`, `secondCategory`
- Relations: photos

Known `system` values in app copy include `history`, `travel`, and `tease`.

## Photo

Uploaded image/content item.

- Primary key: `id`
- File identity: `filename`
- User-facing fields: `name`, `description`
- Engagement: `viewedTimes`, votes relation
- Category: required `categoryId`
- Status: string default `reviewing`
- Optional author by `authorOpenId`

Known photo statuses come from shared constants and include `reviewing`, `passed`, and `rejected`.

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
