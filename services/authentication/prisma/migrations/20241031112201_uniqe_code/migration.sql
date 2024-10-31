/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Verification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Verification_code_key" ON "Verification"("code");
