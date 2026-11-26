import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { utmerkelseUpdateSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ utmerkelseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { utmerkelseId } = await params;
  const existing = await prisma.utmerkelse.findUnique({ where: { id: utmerkelseId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Fant ikke utmerkelsen" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = utmerkelseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const updated = await prisma.utmerkelse.update({
    where: { id: utmerkelseId },
    data: {
      ...(parsed.data.kategori !== undefined ? { kategori: parsed.data.kategori } : {}),
      ...(parsed.data.begrunnelse !== undefined ? { begrunnelse: parsed.data.begrunnelse } : {}),
      ...(parsed.data.poeng !== undefined ? { poeng: parsed.data.poeng } : {}),
    },
    include: { student: true },
  });

  return NextResponse.json({
    utmerkelse: {
      id: updated.id,
      studentId: updated.studentId,
      studentName: updated.student.label,
      kategori: updated.kategori,
      begrunnelse: updated.begrunnelse,
      poeng: updated.poeng,
      dato: updated.dato.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ utmerkelseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { utmerkelseId } = await params;
  const existing = await prisma.utmerkelse.findUnique({ where: { id: utmerkelseId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Fant ikke utmerkelsen" }, { status: 404 });
  }

  await prisma.utmerkelse.delete({ where: { id: utmerkelseId } });

  return NextResponse.json({ ok: true });
}
