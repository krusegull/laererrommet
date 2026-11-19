-- CreateTable
CREATE TABLE "Maal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "malId" TEXT NOT NULL,
    "elevMaal" TEXT,
    "laererMaal" TEXT,
    "notat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Maal_userId_idx" ON "Maal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Maal_studentId_malId_key" ON "Maal"("studentId", "malId");

-- AddForeignKey
ALTER TABLE "Maal" ADD CONSTRAINT "Maal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maal" ADD CONSTRAINT "Maal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maal" ADD CONSTRAINT "Maal_malId_fkey" FOREIGN KEY ("malId") REFERENCES "VurderingsMal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
