import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { elevTekstKommentarCreateSchema } from "@/lib/validations";
import { getOwnedElevTekst } from "@/lib/vurdering/getOwnedElevTekst";

export async function POST(request: Request, { params }: { params: Promise<{ tekstId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { tekstId } = await params;
  const tekst = await getOwnedElevTekst(tekstId, session.user.id);
  if (!tekst) {
    return NextResponse.json({ error: "Fant ikke elevteksten" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = elevTekstKommentarCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  if (parsed.data.endOffset > tekst.tekst.length) {
    return NextResponse.json({ error: "Tekstutvalget ligger utenfor teksten" }, { status: 400 });
  }

  const overlaps = tekst.kommentarer.some(
    (k) => parsed.data.startOffset < k.endOffset && parsed.data.endOffset > k.startOffset
  );
  if (overlaps) {
    return NextResponse.json(
      { error: "Dette tekstutvalget overlapper med en eksisterende kommentar" },
      { status: 400 }
    );
  }

  const kommentar = await prisma.elevTekstKommentar.create({
    data: {
      elevTekstId: tekstId,
      startOffset: parsed.data.startOffset,
      endOffset: parsed.data.endOffset,
      kommentar: parsed.data.kommentar,
      kilde: "laerer",
    },
  });

  return NextResponse.json({
    kommentar: {
      id: kommentar.id,
      startOffset: kommentar.startOffset,
      endOffset: kommentar.endOffset,
      kommentar: kommentar.kommentar,
      kilde: kommentar.kilde,
      createdAt: kommentar.createdAt.toISOString(),
    },
  });
}
