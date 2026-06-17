-- BoFans architecture refresh.
-- Converts string contracts into enums, renames Category to PhotoCategory,
-- preserves existing ids, and adds operational indexes/timestamps.

CREATE TYPE "PhotoStatus" AS ENUM ('reviewing', 'passed', 'rejected');
CREATE TYPE "CategorySystem" AS ENUM ('history', 'travel', 'tease');

ALTER TABLE "Category" RENAME TO "PhotoCategory";
ALTER TABLE "PhotoCategory" RENAME COLUMN "name" TO "systemName";
ALTER TABLE "PhotoCategory" RENAME COLUMN "secondCategory" TO "name";

ALTER TABLE "PhotoCategory"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "PhotoCategory"
SET "system" = CASE
  WHEN "system" IN ('history', 'travel', 'tease') THEN "system"
  WHEN "systemName" IN ('博游', 'travel') THEN 'travel'
  WHEN "systemName" IN ('博逗', 'tease') THEN 'tease'
  ELSE 'history'
END;

ALTER TABLE "PhotoCategory"
  ALTER COLUMN "system" TYPE "CategorySystem"
  USING "system"::"CategorySystem";

ALTER TABLE "Photo"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Photo" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Photo"
  ALTER COLUMN "status" TYPE "PhotoStatus"
  USING CASE
    WHEN "status" IN ('reviewing', 'passed', 'rejected') THEN "status"
    ELSE 'reviewing'
  END::"PhotoStatus";

ALTER TABLE "Photo" ALTER COLUMN "status" SET DEFAULT 'reviewing';

WITH canonical_categories AS (
  SELECT "system", "name", MIN("id") AS keep_id
  FROM "PhotoCategory"
  GROUP BY "system", "name"
  HAVING COUNT(*) > 1
),
duplicate_categories AS (
  SELECT c."id", canonical.keep_id
  FROM "PhotoCategory" c
  JOIN canonical_categories canonical
    ON c."system" = canonical."system"
   AND c."name" = canonical."name"
   AND c."id" <> canonical.keep_id
)
UPDATE "Photo"
SET "categoryId" = duplicate_categories.keep_id
FROM duplicate_categories
WHERE "Photo"."categoryId" = duplicate_categories."id";

WITH canonical_categories AS (
  SELECT "system", "name", MIN("id") AS keep_id
  FROM "PhotoCategory"
  GROUP BY "system", "name"
  HAVING COUNT(*) > 1
)
DELETE FROM "PhotoCategory" c
USING canonical_categories canonical
WHERE c."system" = canonical."system"
  AND c."name" = canonical."name"
  AND c."id" <> canonical.keep_id;

ALTER TABLE "PhotoVote"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "PhotoCategory" DROP CONSTRAINT IF EXISTS "Category_name_secondCategory_key";
ALTER TABLE "PhotoCategory" ADD CONSTRAINT "PhotoCategory_system_name_key" UNIQUE ("system", "name");

CREATE INDEX IF NOT EXISTS "PhotoCategory_system_idx" ON "PhotoCategory"("system");
CREATE INDEX IF NOT EXISTS "Photo_authorOpenId_status_idx" ON "Photo"("authorOpenId", "status");
CREATE INDEX IF NOT EXISTS "Photo_categoryId_idx" ON "Photo"("categoryId");
CREATE INDEX IF NOT EXISTS "Photo_status_idx" ON "Photo"("status");
CREATE INDEX IF NOT EXISTS "PhotoVote_userOpenId_idx" ON "PhotoVote"("userOpenId");
