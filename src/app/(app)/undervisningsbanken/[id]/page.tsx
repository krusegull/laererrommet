import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonPlanDetailClient } from "./LessonPlanDetailClient";

export default async function LessonPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const plan = await prisma.lessonPlan.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      likes: { select: { userId: true } },
      ratings: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!plan) notFound();

  const myRating = plan.ratings.find((r) => r.userId === session!.user.id) ?? null;

  const data = {
    id: plan.id,
    title: plan.title,
    subject: plan.subject,
    grade: plan.grade,
    description: plan.description,
    content: plan.content,
    hasFile: Boolean(plan.fileName),
    fileName: plan.fileName,
    fileSize: plan.fileSize,
    authorName: plan.user.name,
    isOwner: plan.user.id === session!.user.id,
    createdAt: plan.createdAt.toISOString(),
    likeCount: plan.likes.length,
    hasLiked: plan.likes.some((l) => l.userId === session!.user.id),
    ratings: plan.ratings.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment,
      whatWorked: r.whatWorked,
      whatDidntWork: r.whatDidntWork,
      authorName: r.user.name,
      createdAt: r.createdAt.toISOString(),
    })),
    myRating: myRating
      ? {
          score: myRating.score,
          comment: myRating.comment,
          whatWorked: myRating.whatWorked,
          whatDidntWork: myRating.whatDidntWork,
        }
      : null,
  };

  return <LessonPlanDetailClient plan={data} />;
}
