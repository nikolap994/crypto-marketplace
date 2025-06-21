/*
  Warnings:

  - You are about to drop the column `priceUsd` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `seller` on the `Product` table. All the data in the column will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_address` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "priceUsd",
DROP COLUMN "seller",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "seller_address" TEXT NOT NULL;
