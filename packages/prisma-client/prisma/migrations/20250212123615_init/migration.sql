/*
  Warnings:

  - Made the column `authorOpenId` on table `Category` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_authorOpenId_fkey";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "authorOpenId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_authorOpenId_fkey" FOREIGN KEY ("authorOpenId") REFERENCES "User"("openId") ON DELETE RESTRICT ON UPDATE CASCADE;
