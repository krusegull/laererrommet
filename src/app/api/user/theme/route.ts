import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.darkMode !== "boolean") {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { darkMode: body.darkMode },
  });

  return NextResponse.json({ ok: true });
}
