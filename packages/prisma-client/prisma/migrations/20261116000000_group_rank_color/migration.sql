ALTER TABLE "GroupRankBoard" ADD COLUMN "accentColor" TEXT;
ALTER TABLE "GroupRankBoard" ADD CONSTRAINT "GroupRankBoard_accentColor_check"
  CHECK ("accentColor" IS NULL OR "accentColor" ~ '^#[0-9A-F]{6}$');
