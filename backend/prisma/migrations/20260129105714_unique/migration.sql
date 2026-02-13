/*
  Warnings:

  - A unique constraint covering the columns `[name,storeId]` on the table `StoreProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StoreProduct_name_storeId_key" ON "StoreProduct"("name", "storeId");
