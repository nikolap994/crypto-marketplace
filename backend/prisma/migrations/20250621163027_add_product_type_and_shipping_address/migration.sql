-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddress" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'digital';
