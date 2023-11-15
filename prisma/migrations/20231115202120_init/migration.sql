/*
  Warnings:

  - You are about to drop the column `chocolatineId` on the `ChocolatineReview` table. All the data in the column will be lost.
  - You are about to drop the column `chocolatineId` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChocolatineReview" DROP COLUMN "chocolatineId",
ADD COLUMN     "chocolatine_id" TEXT;

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "chocolatineId",
ADD COLUMN     "chocolatine_id" TEXT;
