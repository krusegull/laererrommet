-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "subjectId" TEXT;

-- CreateTable
CREATE TABLE "CalendarSubject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorIndex" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSubject_userId_name_key" ON "CalendarSubject"("userId", "name");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CalendarSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSubject" ADD CONSTRAINT "CalendarSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

