-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "isPublic",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'undervisning',
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyFridayDigest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TerminlisteEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "grade" TEXT NOT NULL,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TerminlisteEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TerminlisteEvent" ADD CONSTRAINT "TerminlisteEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

