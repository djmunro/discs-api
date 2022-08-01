-- CreateTable
CREATE TABLE "Disc" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "glide" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL,
    "Fade" INTEGER NOT NULL
);
