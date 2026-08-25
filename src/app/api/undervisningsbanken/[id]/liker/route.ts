import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const plan = await prisma.lessonPlan.findUnique({ where: { id }, select: { id: true } });
  if (!plan) {
    return NextResponse.json({ error: "Fant ikke opplegget" }, { status: 404 });
  }

  try {
    await prisma.lessonPlanLike.create({
      data: { userId: session.user.id, lessonPlanId: id },
    });
  } catch {
    return NextResponse.json({ error: "Du har allerede likt dette opplegget" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.lessonPlanLike.deleteMany({
    where: { userId: session.user.id, lessonPlanId: id },
  });

  return NextResponse.json({ ok: true });
}
