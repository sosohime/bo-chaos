-- CreateTable
CREATE TABLE "GroupRankUser" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "openId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupRankUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRankSpace" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "openGid" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupRankSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRankMember" (
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupRankMember_pkey" PRIMARY KEY ("spaceId","userId")
);

-- CreateTable
CREATE TABLE "GroupRankBoard" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "templateSnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupRankBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRankEntry" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "value" DECIMAL(14,3),
    "deletedAt" TIMESTAMPTZ(3),
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GroupRankEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupRankUser_appId_openId_key" ON "GroupRankUser"("appId", "openId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupRankSpace_appId_openGid_key" ON "GroupRankSpace"("appId", "openGid");

-- CreateIndex
CREATE INDEX "GroupRankMember_userId_idx" ON "GroupRankMember"("userId");

-- CreateIndex
CREATE INDEX "GroupRankBoard_spaceId_createdAt_idx" ON "GroupRankBoard"("spaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GroupRankBoard_spaceId_creatorId_requestId_key" ON "GroupRankBoard"("spaceId", "creatorId", "requestId");

-- CreateIndex
CREATE INDEX "GroupRankEntry_boardId_createdAt_userId_idx" ON "GroupRankEntry"("boardId", "createdAt", "userId");

-- CreateIndex
CREATE INDEX "GroupRankEntry_boardId_userId_createdAt_idx" ON "GroupRankEntry"("boardId", "userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GroupRankEntry_boardId_userId_requestId_key" ON "GroupRankEntry"("boardId", "userId", "requestId");

-- AddForeignKey
ALTER TABLE "GroupRankMember" ADD CONSTRAINT "GroupRankMember_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "GroupRankSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRankMember" ADD CONSTRAINT "GroupRankMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "GroupRankUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRankBoard" ADD CONSTRAINT "GroupRankBoard_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "GroupRankSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRankBoard" ADD CONSTRAINT "GroupRankBoard_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "GroupRankUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRankEntry" ADD CONSTRAINT "GroupRankEntry_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "GroupRankBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRankEntry" ADD CONSTRAINT "GroupRankEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "GroupRankUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep retry tombstones without retaining the deleted score.
ALTER TABLE "GroupRankEntry" ADD CONSTRAINT "GroupRankEntry_deletion_value_check"
CHECK (("deletedAt" IS NULL AND "value" IS NOT NULL) OR ("deletedAt" IS NOT NULL AND "value" IS NULL));

ALTER TABLE "GroupRankBoard" ADD CONSTRAINT "GroupRankBoard_status_check"
CHECK ("status" IN ('open', 'paused', 'closed'));
