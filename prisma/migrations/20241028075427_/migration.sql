/*
  Warnings:

  - You are about to drop the column `address` on the `Bakery` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Bakery` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Bakery` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Bakery` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Bakery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bakery" DROP COLUMN "address",
DROP COLUMN "description",
DROP COLUMN "image",
DROP COLUMN "location",
DROP COLUMN "name";
