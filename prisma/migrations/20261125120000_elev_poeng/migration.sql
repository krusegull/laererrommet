-- CreateTable
CREATE TABLE "ElevPoeng" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classProfileId" TEXT,
    "fag" TEXT NOT NULL,
    "poeng" INTEGER NOT NULL,
    "tema" TEXT NOT NULL,
    "kilde" TEXT NOT NULL DEFAULT '',
    "gruppe" TEXT,
    "batchId" TEXT NOT NULL,
    "dato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElevPoeng_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ElevPoeng_studentId_idx" ON "ElevPoeng"("studentId");

-- CreateIndex
CREATE INDEX "ElevPoeng_userId_fag_idx" ON "ElevPoeng"("userId", "fag");

-- CreateIndex
CREATE INDEX "ElevPoeng_classProfileId_idx" ON "ElevPoeng"("classProfileId");

-- CreateIndex
CREATE INDEX "ElevPoeng_batchId_idx" ON "ElevPoeng"("batchId");

-- AddForeignKey
ALTER TABLE "ElevPoeng" ADD CONSTRAINT "ElevPoeng_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevPoeng" ADD CONSTRAINT "ElevPoeng_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevPoeng" ADD CONSTRAINT "ElevPoeng_classProfileId_fkey" FOREIGN KEY ("classProfileId") REFERENCES "ClassProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
