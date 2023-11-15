/*
  Warnings:

  - A unique constraint covering the columns `[user_id_shop_id]` on the table `ChocolatineReview` will be added. If there are existing duplicate values, this will fail.
  - Made the column `user_id_shop_id` on table `ChocolatineReview` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChocolatineReview" ALTER COLUMN "user_id_shop_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChocolatineReview_user_id_shop_id_key" ON "ChocolatineReview"("user_id_shop_id");
