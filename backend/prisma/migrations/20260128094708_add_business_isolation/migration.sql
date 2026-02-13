/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Debt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PosProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockTransfer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoreGoods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Warehouse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WarehouseGoods` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PosProduct" DROP CONSTRAINT "PosProduct_userId_fkey";

-- DropForeignKey
ALTER TABLE "StockTransfer" DROP CONSTRAINT "StockTransfer_fromWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "StockTransfer" DROP CONSTRAINT "StockTransfer_toStoreId_fkey";

-- DropForeignKey
ALTER TABLE "StockTransfer" DROP CONSTRAINT "StockTransfer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_userId_fkey";

-- DropForeignKey
ALTER TABLE "StoreGoods" DROP CONSTRAINT "StoreGoods_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_userId_fkey";

-- DropForeignKey
ALTER TABLE "WarehouseGoods" DROP CONSTRAINT "WarehouseGoods_warehouseId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Debt";

-- DropTable
DROP TABLE "PosProduct";

-- DropTable
DROP TABLE "StockTransfer";

-- DropTable
DROP TABLE "Store";

-- DropTable
DROP TABLE "StoreGoods";

-- DropTable
DROP TABLE "Warehouse";

-- DropTable
DROP TABLE "WarehouseGoods";

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
