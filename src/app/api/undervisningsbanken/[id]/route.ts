import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

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

  if (!plan) {
    return NextResponse.json({ error: "Fant ikke opplegget" }, { status: 404 });
  }

  const myRating = plan.ratings.find((r) => r.userId === session.user.id) ?? null;

  return NextResponse.json({
    plan: {
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
      authorId: plan.user.id,
      isOwner: plan.user.id === session.user.id,
      createdAt: plan.createdAt.toISOString(),
      likeCount: plan.likes.length,
      hasLiked: plan.likes.some((l) => l.userId === session.user.id),
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
    },
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const plan = await prisma.lessonPlan.findUnique({ where: { id }, select: { userId: true } });
  if (!plan) {
    return NextResponse.json({ error: "Fant ikke opplegget" }, { status: 404 });
  }

  if (plan.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Du har ikke tilgang til å slette dette opplegget" }, { status: 403 });
  }

  await prisma.lessonPlan.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
