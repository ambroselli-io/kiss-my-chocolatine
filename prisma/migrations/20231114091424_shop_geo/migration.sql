/*
  Warnings:

  - Made the column `latitude` on table `Shop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `Shop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;
