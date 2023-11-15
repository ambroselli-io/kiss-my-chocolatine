/*
  Warnings:

  - You are about to drop the column `chocolatine_id` on the `Award` table. All the data in the column will be lost.
  - You are about to drop the column `chocolatine_id` on the `ChocolatineReview` table. All the data in the column will be lost.
  - You are about to drop the column `chocolatine_id` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the `Chocolatine` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Award" DROP COLUMN "chocolatine_id";

-- AlterTable
ALTER TABLE "ChocolatineReview" DROP COLUMN "chocolatine_id";

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "chocolatine_id";

-- DropTable
DROP TABLE "Chocolatine";
