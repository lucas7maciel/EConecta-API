/*
  Warnings:

  - You are about to drop the column `latitude` on the `TrashSpot` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `TrashSpot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TrashSpot" DROP COLUMN "latitude",
DROP COLUMN "longitude";
