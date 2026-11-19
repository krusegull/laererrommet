import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { elevTekstKommentarUpdateSchema } from "@/lib/validations";
import { getOwnedElevTekst } from "@/lib/vurdering/getOwnedElevTekst";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tekstId: string; kommentarId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { tekstId, kommentarId } = await params;
  const tekst = await getOwnedElevTekst(tekstId, session.user.id);
  if (!tekst) {
    return NextResponse.json({ error: "Fant ikke elevteksten" }, { status: 404 });
  }
  if (!tekst.kommentarer.some((k) => k.id === kommentarId)) {
    return NextResponse.json({ error: "Fant ikke kommentaren" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = elevTekstKommentarUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const updated = await prisma.elevTekstKommentar.update({
    where: { id: kommentarId },
    data: { kommentar: parsed.data.kommentar },
  });

  return NextResponse.json({
    kommentar: {
      id: updated.id,
      startOffset: updated.startOffset,
      endOffset: updated.endOffset,
      kommentar: updated.kommentar,
      kilde: updated.kilde,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tekstId: string; kommentarId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { tekstId, kommentarId } = await params;
  const tekst = await getOwnedElevTekst(tekstId, session.user.id);
  if (!tekst) {
    return NextResponse.json({ error: "Fant ikke elevteksten" }, { status: 404 });
  }
  if (!tekst.kommentarer.some((k) => k.id === kommentarId)) {
    return NextResponse.json({ error: "Fant ikke kommentaren" }, { status: 404 });
  }

  await prisma.elevTekstKommentar.delete({ where: { id: kommentarId } });

  return NextResponse.json({ ok: true });
}
