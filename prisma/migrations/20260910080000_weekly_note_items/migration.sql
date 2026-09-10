-- DropIndex
DROP INDEX "WeeklyNote_userId_weekStart_dayOfWeek_key";

-- AlterTable
ALTER TABLE "WeeklyNote" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "WeeklyNote_userId_weekStart_dayOfWeek_idx" ON "WeeklyNote"("userId", "weekStart", "dayOfWeek");
