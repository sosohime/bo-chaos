ALTER TABLE "GroupRankEntry" ADD COLUMN "recordedById" TEXT REFERENCES "GroupRankUser"("id");
CREATE TABLE "GroupRankProxyParticipant" (
 "id" TEXT PRIMARY KEY, "boardId" TEXT NOT NULL REFERENCES "GroupRankBoard"("id") ON DELETE CASCADE,
 "displayName" VARCHAR(24) NOT NULL, "requestId" TEXT NOT NULL,
 "claimantUserId" TEXT REFERENCES "GroupRankUser"("id"), "claimedUserId" TEXT REFERENCES "GroupRankUser"("id"),
 "claimedAt" TIMESTAMPTZ(3), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "GroupRankProxyParticipant_claim_consistency" CHECK (("claimedUserId" IS NULL) = ("claimedAt" IS NULL)),
 CONSTRAINT "GroupRankProxyParticipant_boardId_requestId_key" UNIQUE ("boardId", "requestId"),
 CONSTRAINT "GroupRankProxyParticipant_id_boardId_key" UNIQUE ("id", "boardId")
);
CREATE INDEX "GroupRankProxyParticipant_boardId_claimedUserId_idx" ON "GroupRankProxyParticipant"("boardId", "claimedUserId");
CREATE TABLE "GroupRankProxyEntry" (
 "id" TEXT PRIMARY KEY, "boardId" TEXT NOT NULL REFERENCES "GroupRankBoard"("id") ON DELETE CASCADE,
 "participantId" TEXT NOT NULL, "requestId" TEXT NOT NULL, "value" DECIMAL(14,3), "deletedAt" TIMESTAMPTZ(3),
 "revision" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMPTZ(3) NOT NULL,
 CONSTRAINT "GroupRankProxyEntry_boardId_requestId_key" UNIQUE ("boardId", "requestId"),
 CONSTRAINT "GroupRankProxyEntry_participant_board_fkey" FOREIGN KEY ("participantId", "boardId") REFERENCES "GroupRankProxyParticipant"("id", "boardId") ON DELETE CASCADE,
 CONSTRAINT "GroupRankProxyEntry_value_consistency" CHECK (("deletedAt" IS NULL AND "value" IS NOT NULL) OR ("deletedAt" IS NOT NULL AND "value" IS NULL))
);
CREATE INDEX "GroupRankProxyEntry_participantId_createdAt_idx" ON "GroupRankProxyEntry"("participantId", "createdAt");
