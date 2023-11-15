/*
  Warnings:

  - You are about to drop the column `user_id_chocolatine_id` on the `ChocolatineReview` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ChocolatineReview_user_id_chocolatine_id_key";

-- AlterTable
ALTER TABLE "ChocolatineReview" DROP COLUMN "user_id_chocolatine_id";
