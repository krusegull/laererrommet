import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { skalaUpdateSchema } from "@/lib/validations";
import { getOwnedMal } from "@/lib/vurdering/getOwnedMal";

export async function PUT(request: Request, { params }: { params: Promise<{ malId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { malId } = await params;
  const mal = await getOwnedMal(malId, session.user.id);
  if (!mal) {
    return NextResponse.json({ error: "Fant ikke vurderingsmalen" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = skalaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  await prisma.vurderingsMal.update({
    where: { id: malId },
    data: { skala: parsed.data.skala },
  });

  return NextResponse.json({ skala: parsed.data.skala });
}
