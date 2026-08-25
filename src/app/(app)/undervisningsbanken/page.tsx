import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UndervisningsbankenClient } from "./UndervisningsbankenClient";

export default async function UndervisningsbankenPage() {
  const session = await getServerSession(authOptions);
  const plans = await prisma.lessonPlan.findMany({
    include: {
      user: { select: { name: true } },
      ratings: { select: { score: true } },
      likes: { select: { userId: true } },
      _count: { select: { ratings: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = plans.map((p) => {
    const avgScore =
      p.ratings.length > 0 ? p.ratings.reduce((sum, r) => sum + r.score, 0) / p.ratings.length : null;
    return {
      id: p.id,
      title: p.title,
      subject: p.subject,
      grade: p.grade,
      description: p.description,
      hasFile: Boolean(p.fileName),
      authorName: p.user.name,
      createdAt: p.createdAt.toISOString(),
      ratingCount: p._count.ratings,
      avgScore,
      likeCount: p._count.likes,
      hasLiked: p.likes.some((l) => l.userId === session!.user.id),
    };
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Undervisningsbanken</h1>
        <p className="mt-1 text-foreground/60">Del og finn undervisningsopplegg med andre lærere.</p>
      </div>
      <UndervisningsbankenClient initialPlans={data} />
    </div>
  );
}
