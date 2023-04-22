/*
  Warnings:

  - A unique constraint covering the columns `[certificationNumber]` on the table `Disc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Disc_certificationNumber_key" ON "Disc"("certificationNumber");
