-- CreateTable
CREATE TABLE "ImportantNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportantNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportantNote_userId_idx" ON "ImportantNote"("userId");

-- AddForeignKey
ALTER TABLE "ImportantNote" ADD CONSTRAINT "ImportantNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
