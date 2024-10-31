/*
  Warnings:

  - You are about to drop the column `ipAdress` on the `LoginHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoginHistory" DROP COLUMN "ipAdress",
ADD COLUMN     "ipAddress" TEXT;
