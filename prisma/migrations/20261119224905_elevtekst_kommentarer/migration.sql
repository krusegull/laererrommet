-- CreateTable
CREATE TABLE "ElevTekstKommentar" (
    "id" TEXT NOT NULL,
    "elevTekstId" TEXT NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "kommentar" TEXT NOT NULL,
    "kilde" TEXT NOT NULL DEFAULT 'laerer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElevTekstKommentar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ElevTekstKommentar_elevTekstId_idx" ON "ElevTekstKommentar"("elevTekstId");

-- AddForeignKey
ALTER TABLE "ElevTekstKommentar" ADD CONSTRAINT "ElevTekstKommentar_elevTekstId_fkey" FOREIGN KEY ("elevTekstId") REFERENCES "ElevTekst"("id") ON DELETE CASCADE ON UPDATE CASCADE;
