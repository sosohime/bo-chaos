BEGIN;

ALTER TABLE "GroupRankBoard" ADD COLUMN "updatedAt" TIMESTAMPTZ(3);

WITH activity AS (
    SELECT "boardId", MAX("updatedAt") AS "latest"
    FROM "GroupRankEntry" GROUP BY "boardId"
    UNION ALL
    SELECT "boardId", MAX("updatedAt") AS "latest"
    FROM "GroupRankProxyEntry" GROUP BY "boardId"
    UNION ALL
    SELECT item."boardId", MAX(vote."createdAt") AS "latest"
    FROM "GroupRankRecommendation" vote
    JOIN "GroupRankRecommendationItem" item ON item."id" = vote."itemId"
    GROUP BY item."boardId"
), latest AS (
    SELECT "boardId", MAX("latest") AS "latest"
    FROM activity GROUP BY "boardId"
)
UPDATE "GroupRankBoard" board
SET "updatedAt" = GREATEST(board."createdAt", latest."latest")
FROM latest
WHERE board."id" = latest."boardId";

UPDATE "GroupRankBoard" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

ALTER TABLE "GroupRankBoard"
    ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN "updatedAt" SET NOT NULL;

CREATE INDEX "GroupRankBoard_spaceId_updatedAt_createdAt_id_idx"
    ON "GroupRankBoard"("spaceId", "updatedAt", "createdAt", "id");
DROP INDEX "GroupRankBoard_spaceId_createdAt_idx";

COMMIT;
