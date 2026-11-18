-- DropIndex
DROP INDEX "SeatingChart_classProfileId_key";

-- AlterTable
ALTER TABLE "SeatingChart" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "label" TEXT NOT NULL DEFAULT 'Klassekart',
ADD COLUMN     "week" INTEGER,
ADD COLUMN     "year" INTEGER;

-- CreateIndex
CREATE INDEX "SeatingChart_classProfileId_idx" ON "SeatingChart"("classProfileId");

-- CreateIndex
CREATE INDEX "SeatingChart_classProfileId_year_week_idx" ON "SeatingChart"("classProfileId", "year", "week");
