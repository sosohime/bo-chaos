/*
  Warnings:

  - You are about to drop the column `authorId` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PhotoVote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[photoId,userOpenId]` on the table `PhotoVote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userOpenId` to the `PhotoVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PhotoVote" DROP CONSTRAINT "PhotoVote_userId_fkey";

-- DropIndex
DROP INDEX "PhotoVote_photoId_userId_key";

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "authorId",
ADD COLUMN     "authorOpenId" TEXT;

-- AlterTable
ALTER TABLE "PhotoVote" DROP COLUMN "userId",
ADD COLUMN     "userOpenId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PhotoVote_photoId_userOpenId_key" ON "PhotoVote"("photoId", "userOpenId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_authorOpenId_fkey" FOREIGN KEY ("authorOpenId") REFERENCES "User"("openId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoVote" ADD CONSTRAINT "PhotoVote_userOpenId_fkey" FOREIGN KEY ("userOpenId") REFERENCES "User"("openId") ON DELETE RESTRICT ON UPDATE CASCADE;
