/*
  Warnings:

  - You are about to drop the column `views` on the `Photo` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "views",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "viewedTimes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "system" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secondCategory" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_secondCategory_key" ON "Category"("name", "secondCategory");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
