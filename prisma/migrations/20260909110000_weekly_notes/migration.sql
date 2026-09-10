-- CreateTable
CREATE TABLE "WeeklyNote" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyNote_userId_weekStart_dayOfWeek_key" ON "WeeklyNote"("userId", "weekStart", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "WeeklyNote" ADD CONSTRAINT "WeeklyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

