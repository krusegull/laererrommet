-- CreateTable
CREATE TABLE "LiveSpill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "tittel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'lobby',
    "antallLag" INTEGER NOT NULL DEFAULT 8,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LiveSpill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSpiller" (
    "id" TEXT NOT NULL,
    "spillId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "lag" INTEGER,
    "riktige" INTEGER NOT NULL DEFAULT 0,
    "sistSett" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiveSpiller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveLag" (
    "id" TEXT NOT NULL,
    "spillId" TEXT NOT NULL,
    "nr" INTEGER NOT NULL,
    "state" JSONB NOT NULL DEFAULT '{}',
    "versjon" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LiveLag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveSpill_kode_key" ON "LiveSpill"("kode");
CREATE INDEX "LiveSpill_userId_idx" ON "LiveSpill"("userId");
CREATE UNIQUE INDEX "LiveSpiller_token_key" ON "LiveSpiller"("token");
CREATE INDEX "LiveSpiller_spillId_idx" ON "LiveSpiller"("spillId");
CREATE UNIQUE INDEX "LiveLag_spillId_nr_key" ON "LiveLag"("spillId", "nr");

-- AddForeignKey
ALTER TABLE "LiveSpill" ADD CONSTRAINT "LiveSpill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveSpiller" ADD CONSTRAINT "LiveSpiller_spillId_fkey" FOREIGN KEY ("spillId") REFERENCES "LiveSpill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveLag" ADD CONSTRAINT "LiveLag_spillId_fkey" FOREIGN KEY ("spillId") REFERENCES "LiveSpill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
