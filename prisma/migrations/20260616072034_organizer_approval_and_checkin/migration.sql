-- CreateEnum
CREATE TYPE "OrganizerStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "submittedById" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "attendedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organization" TEXT,
ADD COLUMN     "organizerNote" TEXT,
ADD COLUMN     "organizerStatus" "OrganizerStatus" NOT NULL DEFAULT 'NONE';

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
