-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('MATRIC', 'IC', 'PASSPORT');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "paymentInstructions" TEXT,
ADD COLUMN     "paymentQrUrl" TEXT,
ADD COLUMN     "tngNumber" TEXT,
ADD COLUMN     "useExternalPayment" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "identityNumber" TEXT,
ADD COLUMN     "identityType" "IdentityType";
