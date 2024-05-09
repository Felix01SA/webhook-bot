/*
  Warnings:

  - You are about to drop the column `last_interaction` on the `Guild` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "secret" TEXT,
    "webhook_channel" TEXT
);
INSERT INTO "new_Guild" ("id", "secret", "webhook_channel") SELECT "id", "secret", "webhook_channel" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
