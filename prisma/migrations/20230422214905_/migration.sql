/*
  Warnings:

  - The `flexibility` column on the `Disc` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Flexibility" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropIndex
DROP INDEX "Disc_certificationNumber_key";

-- AlterTable
ALTER TABLE "Disc" DROP COLUMN "flexibility",
ADD COLUMN     "flexibility" "Flexibility",
ALTER COLUMN "approvedDate" DROP NOT NULL,
ALTER COLUMN "approvedDate" DROP DEFAULT;
