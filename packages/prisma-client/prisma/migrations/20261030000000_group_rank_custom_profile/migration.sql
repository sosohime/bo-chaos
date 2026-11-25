-- Additive migration: only the isolated group-ranking schema is touched.
ALTER TABLE "GroupRankUser" ADD COLUMN "nickname" VARCHAR(24), ADD COLUMN "avatarKey" VARCHAR(80);
ALTER TABLE "GroupRankBoard" ADD COLUMN "draftId" TEXT, ADD COLUMN "deletedAt" TIMESTAMPTZ(3);
CREATE TABLE "GroupRankDraft" (
  "id" TEXT NOT NULL PRIMARY KEY, "appId" TEXT NOT NULL, "creatorId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL, "definition" JSONB NOT NULL, "reviewTrace" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMPTZ(3),
  CONSTRAINT "GroupRankDraft_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "GroupRankUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "GroupRankDraft_creatorId_requestId_key" ON "GroupRankDraft"("creatorId", "requestId");
CREATE INDEX "GroupRankDraft_appId_expiresAt_idx" ON "GroupRankDraft"("appId", "expiresAt");
ALTER TABLE "GroupRankBoard" ADD CONSTRAINT "GroupRankBoard_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "GroupRankDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "GroupRankReport" (
  "id" TEXT NOT NULL PRIMARY KEY, "boardId" TEXT NOT NULL, "reporterId" TEXT NOT NULL,
  "reason" TEXT NOT NULL CHECK ("reason" IN ('inappropriate', 'privacy', 'other')),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupRankReport_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "GroupRankBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GroupRankReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "GroupRankUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "GroupRankReport_boardId_reporterId_key" ON "GroupRankReport"("boardId", "reporterId");
CREATE INDEX "GroupRankReport_createdAt_idx" ON "GroupRankReport"("createdAt");
