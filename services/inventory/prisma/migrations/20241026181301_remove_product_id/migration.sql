/*
  Warnings:

  - You are about to drop the column `productId` on the `History` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "History_productId_key";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "productId";
