import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** DELETE: slett én poengrad (fra elevoversikten). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;
  const { count } = await prisma.elevPoeng.deleteMany({ where: { id, userId: session.user.id } });
  if (count === 0) {
    return NextResponse.json({ error: "Fant ikke poengene" }, { status: 404 });
  }
  return NextResponse.json({ deleted: count });
}
