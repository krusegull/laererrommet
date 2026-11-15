-- CreateTable
CREATE TABLE "ClassStudent" (
    "id" TEXT NOT NULL,
    "classProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingChart" (
    "id" TEXT NOT NULL,
    "classProfileId" TEXT NOT NULL,
    "roomObjects" JSONB NOT NULL DEFAULT '[]',
    "podLayout" JSONB NOT NULL DEFAULT '[]',
    "pods" JSONB NOT NULL DEFAULT '[]',
    "locks" JSONB NOT NULL DEFAULT '[]',
    "pairHistory" JSONB NOT NULL DEFAULT '{}',
    "grupper" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingChart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassStudent_classProfileId_idx" ON "ClassStudent"("classProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatingChart_classProfileId_key" ON "SeatingChart"("classProfileId");

-- AddForeignKey
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_classProfileId_fkey" FOREIGN KEY ("classProfileId") REFERENCES "ClassProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingChart" ADD CONSTRAINT "SeatingChart_classProfileId_fkey" FOREIGN KEY ("classProfileId") REFERENCES "ClassProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
