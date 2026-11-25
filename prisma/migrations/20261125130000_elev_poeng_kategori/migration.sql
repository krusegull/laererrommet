-- AlterTable
ALTER TABLE "ElevPoeng" ADD COLUMN "kategori" TEXT NOT NULL DEFAULT 'faglig',
ADD COLUMN "konkurranse" TEXT,
ADD COLUMN "plassering" INTEGER;

-- CreateIndex
CREATE INDEX "ElevPoeng_studentId_kategori_idx" ON "ElevPoeng"("studentId", "kategori");
