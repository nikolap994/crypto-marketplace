/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `seller_address` on the `Product` table. All the data in the column will be lost.
  - Added the required column `priceUsd` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
DROP COLUMN "seller_address",
ADD COLUMN     "priceUsd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "seller" TEXT NOT NULL;
