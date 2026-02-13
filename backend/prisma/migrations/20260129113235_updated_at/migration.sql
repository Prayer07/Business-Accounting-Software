/*
  Warnings:

  - Added the required column `updatedAt` to the `Warehouse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
