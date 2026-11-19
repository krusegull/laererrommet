-- AlterTable
ALTER TABLE "ClassStudent" ADD COLUMN     "studentId" TEXT;

-- CreateTable
CREATE TABLE "ElevTekst" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classStudentId" TEXT,
    "malId" TEXT NOT NULL,
    "tittel" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "score" INTEGER,
    "karakter" TEXT,
    "tilbakemelding" TEXT,
    "dato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElevTekst_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ElevTekst_userId_idx" ON "ElevTekst"("userId");

-- CreateIndex
CREATE INDEX "ElevTekst_studentId_idx" ON "ElevTekst"("studentId");

-- CreateIndex
CREATE INDEX "ElevTekst_malId_idx" ON "ElevTekst"("malId");

-- CreateIndex
CREATE INDEX "ClassStudent_studentId_idx" ON "ClassStudent"("studentId");

-- AddForeignKey
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevTekst" ADD CONSTRAINT "ElevTekst_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevTekst" ADD CONSTRAINT "ElevTekst_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevTekst" ADD CONSTRAINT "ElevTekst_classStudentId_fkey" FOREIGN KEY ("classStudentId") REFERENCES "ClassStudent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevTekst" ADD CONSTRAINT "ElevTekst_malId_fkey" FOREIGN KEY ("malId") REFERENCES "VurderingsMal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
