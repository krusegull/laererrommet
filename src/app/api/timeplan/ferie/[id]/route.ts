import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.schoolBreak.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke ferieperioden" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Du har ikke tilgang til denne ferieperioden" }, { status: 403 });
  }

  await prisma.schoolBreak.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
