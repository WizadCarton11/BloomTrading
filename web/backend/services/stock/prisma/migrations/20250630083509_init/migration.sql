/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_accountId_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "transactions";

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "TransactionType";
