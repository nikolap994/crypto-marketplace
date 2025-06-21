/*
  Warnings:

  - Added the required column `platformAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformTxHash` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "platformAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "platformTxHash" TEXT NOT NULL,
ADD COLUMN     "sellerAmount" DOUBLE PRECISION NOT NULL;
