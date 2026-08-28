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

  const existing = await prisma.terminlisteEvent.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke hendelsen" }, { status: 404 });
  }
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Du har ikke tilgang til å slette denne hendelsen" }, { status: 403 });
  }

  await prisma.terminlisteEvent.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
