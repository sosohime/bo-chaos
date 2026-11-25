ALTER TABLE "GroupRankBoard" ADD COLUMN "themeId" TEXT NOT NULL DEFAULT 'volt';
ALTER TABLE "GroupRankBoard" ADD CONSTRAINT "GroupRankBoard_themeId_check" CHECK ("themeId" IN ('volt', 'midnight', 'coral'));
