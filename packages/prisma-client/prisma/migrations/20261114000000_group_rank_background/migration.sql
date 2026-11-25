ALTER TABLE "GroupRankBoard" ADD COLUMN "background" JSONB;
CREATE TABLE "GroupRankBackground" (
 "id" TEXT NOT NULL PRIMARY KEY, "appId" TEXT NOT NULL, "ownerId" TEXT NOT NULL,
 "requestId" VARCHAR(64) NOT NULL, "storageKey" VARCHAR(80) NOT NULL,
 "digest" VARCHAR(64) NOT NULL, "imageWidth" INTEGER NOT NULL, "imageHeight" INTEGER NOT NULL,
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "GroupRankBackground_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "GroupRankUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "GroupRankBackground_ownerId_requestId_key" ON "GroupRankBackground"("ownerId", "requestId");
CREATE INDEX "GroupRankBackground_ownerId_createdAt_idx" ON "GroupRankBackground"("ownerId", "createdAt");
