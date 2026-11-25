CREATE TABLE "GroupRankRecommendationItem" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "modelKey" TEXT NOT NULL,
    CONSTRAINT "GroupRankRecommendationItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupRankRecommendation" (
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupRankRecommendation_pkey" PRIMARY KEY ("itemId", "userId")
);

CREATE UNIQUE INDEX "GroupRankRecommendationItem_boardId_modelKey_key" ON "GroupRankRecommendationItem"("boardId", "modelKey");
CREATE INDEX "GroupRankRecommendation_userId_idx" ON "GroupRankRecommendation"("userId");

ALTER TABLE "GroupRankRecommendationItem" ADD CONSTRAINT "GroupRankRecommendationItem_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "GroupRankBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupRankRecommendation" ADD CONSTRAINT "GroupRankRecommendation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "GroupRankRecommendationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupRankRecommendation" ADD CONSTRAINT "GroupRankRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "GroupRankUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
