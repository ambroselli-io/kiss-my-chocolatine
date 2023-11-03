-- DropForeignKey
ALTER TABLE "UserAction" DROP CONSTRAINT "UserAction_user_id_fkey";

-- AlterTable
ALTER TABLE "UserAction" ADD COLUMN     "user_email" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
