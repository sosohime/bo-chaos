-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "authorOpenId" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_authorOpenId_fkey" FOREIGN KEY ("authorOpenId") REFERENCES "User"("openId") ON DELETE SET NULL ON UPDATE CASCADE;
