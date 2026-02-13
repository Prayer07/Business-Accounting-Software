-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "productId" INTEGER;

-- AlterTable
ALTER TABLE "StoreProduct" ADD COLUMN     "businessId" INTEGER;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
