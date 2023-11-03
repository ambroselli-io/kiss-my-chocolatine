-- AlterTable
ALTER TABLE "Chocolatine" ADD COLUMN     "created_by_user_email" TEXT,
ADD COLUMN     "shop_name" TEXT;

-- AlterTable
ALTER TABLE "ChocolatineReview" ADD COLUMN     "shop_name" TEXT,
ADD COLUMN     "user_email" TEXT;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "created_by_user_email" TEXT;
