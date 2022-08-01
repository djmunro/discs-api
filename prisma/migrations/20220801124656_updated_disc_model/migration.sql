/*
  Warnings:

  - You are about to drop the column `Fade` on the `Disc` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Disc` table. All the data in the column will be lost.
  - Added the required column `fade` to the `Disc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Disc` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Disc" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "glide" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL,
    "fade" INTEGER NOT NULL
);
INSERT INTO "new_Disc" ("glide", "id", "manufacturer", "speed", "turn") SELECT "glide", "id", "manufacturer", "speed", "turn" FROM "Disc";
DROP TABLE "Disc";
ALTER TABLE "new_Disc" RENAME TO "Disc";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
