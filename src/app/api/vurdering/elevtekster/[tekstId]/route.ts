import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { elevTekstUpdateSchema } from "@/lib/validations";
import { getOwnedElevTekst } from "@/lib/vurdering/getOwnedElevTekst";
import { resolveKarakter } from "@/lib/vurdering/karakter";
import type { SkalaEntry } from "@/lib/vurdering/types";

function serialize(tekst: Awaited<ReturnType<typeof getOwnedElevTekst>>) {
  if (!tekst) return null;
  return {
    id: tekst.id,
    studentId: tekst.studentId,
    studentName: tekst.student.label,
    malId: tekst.malId,
    malName: tekst.mal.name,
    tittel: tekst.tittel,
    tekst: tekst.tekst,
    score: tekst.score,
    karakter: tekst.karakter,
    tilbakemelding: tekst.tilbakemelding,
    skala: tekst.mal.skala,
    dato: tekst.dato.toISOString(),
    updatedAt: tekst.updatedAt.toISOString(),
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ tekstId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { tekstId } = await params;
  const tekst = await getOwnedElevTekst(tekstId, session.user.id);
  if (!tekst) {
    return NextResponse.json({ error: "Fant ikke elevteksten" }, { status: 404 });
  }

  return NextResponse.json({ tekst: serialize(tekst) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ tekstId: string }> }) {
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
  const parsed = elevTekstUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const nextScore = parsed.data.score !== undefined ? parsed.data.score : tekst.score;
  const karakter = resolveKarakter(nextScore, tekst.mal.skala as unknown as SkalaEntry[]);

  const updated = await prisma.elevTekst.update({
    where: { id: tekstId },
    data: {
      ...(parsed.data.tittel !== undefined ? { tittel: parsed.data.tittel } : {}),
      ...(parsed.data.tekst !== undefined ? { tekst: parsed.data.tekst } : {}),
      ...(parsed.data.dato !== undefined ? { dato: new Date(parsed.data.dato) } : {}),
      ...(parsed.data.score !== undefined ? { score: parsed.data.score, karakter } : {}),
      ...(parsed.data.tilbakemelding !== undefined ? { tilbakemelding: parsed.data.tilbakemelding } : {}),
    },
    include: { student: true, mal: { include: { kriterier: { orderBy: { order: "asc" } } } } },
  });

  return NextResponse.json({ tekst: serialize(updated) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ tekstId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { tekstId } = await params;
  const tekst = await getOwnedElevTekst(tekstId, session.user.id);
  if (!tekst) {
    return NextResponse.json({ error: "Fant ikke elevteksten" }, { status: 404 });
  }

  await prisma.elevTekst.delete({ where: { id: tekstId } });

  return NextResponse.json({ ok: true });
}
