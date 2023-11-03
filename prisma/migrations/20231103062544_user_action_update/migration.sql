/*
  Warnings:

  - You are about to drop the column `shares` on the `UserAction` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Action" ADD VALUE 'FEEDBACK';

-- AlterTable
ALTER TABLE "UserAction" DROP COLUMN "shares";
