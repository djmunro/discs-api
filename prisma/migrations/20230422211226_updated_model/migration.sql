/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Disc" (
    "id" SERIAL NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "discModel" TEXT NOT NULL,
    "maxWeight" DOUBLE PRECISION,
    "diameter" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "rimDepth" DOUBLE PRECISION,
    "insideRimDiameter" DOUBLE PRECISION,
    "rimThickness" DOUBLE PRECISION,
    "rimConfiguration" DOUBLE PRECISION,
    "flexibility" DOUBLE PRECISION,
    "certificationNumber" TEXT,
    "approvedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disc_pkey" PRIMARY KEY ("id")
);
