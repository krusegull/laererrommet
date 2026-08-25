-- AlterTable
ALTER TABLE "LessonPlan" DROP COLUMN "likes",
ADD COLUMN     "fileData" BYTEA,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "rightsConfirmed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LessonPlanLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonPlanLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlanLike_userId_lessonPlanId_key" ON "LessonPlanLike"("userId", "lessonPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_lessonPlanId_key" ON "Rating"("userId", "lessonPlanId");

-- AddForeignKey
ALTER TABLE "LessonPlanLike" ADD CONSTRAINT "LessonPlanLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanLike" ADD CONSTRAINT "LessonPlanLike_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

