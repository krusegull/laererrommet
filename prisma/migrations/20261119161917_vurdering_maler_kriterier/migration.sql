-- CreateTable
CREATE TABLE "VurderingsMal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "skala" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VurderingsMal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VurderingsKriterium" (
    "id" TEXT NOT NULL,
    "malId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL,
    "ekstraBra" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VurderingsKriterium_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VurderingsKriterium_malId_idx" ON "VurderingsKriterium"("malId");

-- AddForeignKey
ALTER TABLE "VurderingsMal" ADD CONSTRAINT "VurderingsMal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VurderingsKriterium" ADD CONSTRAINT "VurderingsKriterium_malId_fkey" FOREIGN KEY ("malId") REFERENCES "VurderingsMal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
