-- CreateTable
CREATE TABLE "Utmerkelse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classStudentId" TEXT,
    "kategori" TEXT NOT NULL,
    "begrunnelse" TEXT,
    "dato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utmerkelse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Utmerkelse_userId_idx" ON "Utmerkelse"("userId");

-- CreateIndex
CREATE INDEX "Utmerkelse_studentId_idx" ON "Utmerkelse"("studentId");

-- AddForeignKey
ALTER TABLE "Utmerkelse" ADD CONSTRAINT "Utmerkelse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utmerkelse" ADD CONSTRAINT "Utmerkelse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utmerkelse" ADD CONSTRAINT "Utmerkelse_classStudentId_fkey" FOREIGN KEY ("classStudentId") REFERENCES "ClassStudent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
