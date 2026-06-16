/*
  Warnings:

  - Added the required column `campus` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContact` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "campus" TEXT NOT NULL,
ADD COLUMN     "culturalNotes" TEXT,
ADD COLUMN     "dressCode" TEXT,
ADD COLUMN     "emergencyContact" TEXT NOT NULL,
ADD COLUMN     "openToPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizer" TEXT,
ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "school" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "blockedReason" TEXT;

-- CreateTable
CREATE TABLE "BlockedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockedEmail_email_key" ON "BlockedEmail"("email");
