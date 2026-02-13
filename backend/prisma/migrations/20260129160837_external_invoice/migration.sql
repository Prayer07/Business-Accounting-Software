/*
  Warnings:

  - You are about to drop the column `name` on the `ExternalInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ExternalInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ExternalInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ExternalInvoice` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `ExternalInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `ExternalInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `ExternalInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID');

-- DropIndex
DROP INDEX "ExternalInvoice_name_key";

-- AlterTable
ALTER TABLE "ExternalInvoice" DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "quantity",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "ExternalInvoiceItem" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ExternalInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalInvoice_businessId_idx" ON "ExternalInvoice"("businessId");

-- AddForeignKey
ALTER TABLE "ExternalInvoice" ADD CONSTRAINT "ExternalInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalInvoiceItem" ADD CONSTRAINT "ExternalInvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ExternalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
