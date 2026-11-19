import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { malUpdateSchema } from "@/lib/validations";
import { getOwnedMal } from "@/lib/vurdering/getOwnedMal";

export async function GET(_request: Request, { params }: { params: Promise<{ malId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { malId } = await params;
  const mal = await getOwnedMal(malId, session.user.id);
  if (!mal) {
    return NextResponse.json({ error: "Fant ikke vurderingsmalen" }, { status: 404 });
  }

  return NextResponse.json({
    mal: {
      id: mal.id,
      name: mal.name,
      description: mal.description,
      skala: mal.skala,
      kriterier: mal.kriterier.map((k) => ({
        id: k.id,
        name: k.name,
        description: k.description,
        weight: k.weight,
        ekstraBra: k.ekstraBra,
      })),
      updatedAt: mal.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ malId: string }> }) {
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
  const parsed = malUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const updated = await prisma.vurderingsMal.update({
    where: { id: malId },
    data: parsed.data,
  });

  return NextResponse.json({ mal: { id: updated.id, name: updated.name, description: updated.description } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ malId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { malId } = await params;
  const mal = await getOwnedMal(malId, session.user.id);
  if (!mal) {
    return NextResponse.json({ error: "Fant ikke vurderingsmalen" }, { status: 404 });
  }

  const elevTekstCount = await prisma.elevTekst.count({ where: { malId } });
  if (elevTekstCount > 0) {
    return NextResponse.json(
      { error: `Kan ikke slette malen - den er i bruk av ${elevTekstCount} elevtekst(er).` },
      { status: 400 }
    );
  }

  await prisma.vurderingsMal.delete({ where: { id: malId } });

  return NextResponse.json({ ok: true });
}
