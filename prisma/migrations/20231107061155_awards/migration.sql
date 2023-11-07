-- CreateEnum
CREATE TYPE "AvailableAward" AS ENUM ('MASTER_PAIN_AU_CHOCOLAT');

-- CreateEnum
CREATE TYPE "Positions" AS ENUM ('WINNER', 'SECOND', 'THIRD', 'FINALIST');

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "award" "AvailableAward" NOT NULL,
    "position" "Positions" NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "shop_id" TEXT,
    "shop_name" TEXT,
    "chocolatine_id" TEXT,
    "chocolatine_name" TEXT,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_chocolatine_id_fkey" FOREIGN KEY ("chocolatine_id") REFERENCES "Chocolatine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
