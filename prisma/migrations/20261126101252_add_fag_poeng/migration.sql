-- CreateTable
CREATE TABLE "FagPoeng" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fag" TEXT NOT NULL,
    "poeng" INTEGER NOT NULL,
    "kilde" TEXT,
    "dato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FagPoeng_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FagPoeng_userId_idx" ON "FagPoeng"("userId");

-- CreateIndex
CREATE INDEX "FagPoeng_studentId_idx" ON "FagPoeng"("studentId");

-- AddForeignKey
ALTER TABLE "FagPoeng" ADD CONSTRAINT "FagPoeng_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FagPoeng" ADD CONSTRAINT "FagPoeng_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
