import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lessonPlanRatingSchema } from "@/lib/validations";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const plan = await prisma.lessonPlan.findUnique({ where: { id }, select: { id: true } });
  if (!plan) {
    return NextResponse.json({ error: "Fant ikke opplegget" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = lessonPlanRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const rating = await prisma.rating.upsert({
    where: { userId_lessonPlanId: { userId: session.user.id, lessonPlanId: id } },
    create: { ...parsed.data, userId: session.user.id, lessonPlanId: id },
    update: parsed.data,
  });

  return NextResponse.json({ rating: { id: rating.id } });
}
