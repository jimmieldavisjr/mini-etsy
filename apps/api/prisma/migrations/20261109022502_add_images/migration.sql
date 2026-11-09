-- AlterTable
ALTER TABLE "catalog_categories" ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "catalog_products" ADD COLUMN "imageSourceUrl" TEXT;
ALTER TABLE "catalog_products" ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ordering_order_lines" ADD COLUMN "imageSnapshot" TEXT;
