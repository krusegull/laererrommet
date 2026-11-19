import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { malCreateSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const maler = await prisma.vurderingsMal.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { kriterier: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    maler: maler.map((m) => ({ id: m.id, name: m.name, description: m.description, kriterieCount: m._count.kriterier })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = malCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const mal = await prisma.vurderingsMal.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({
    mal: { id: mal.id, name: mal.name, description: mal.description, kriterieCount: 0 },
  });
}
