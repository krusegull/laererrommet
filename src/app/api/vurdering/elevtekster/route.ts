import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { elevTekstCreateSchema } from "@/lib/validations";
import { resolveStudentLink } from "@/lib/vurdering/resolveStudentLink";
import { resolveKarakter } from "@/lib/vurdering/karakter";
import type { SkalaEntry } from "@/lib/vurdering/types";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const malId = searchParams.get("malId");

  const tekster = await prisma.elevTekst.findMany({
    where: {
      userId: session.user.id,
      ...(studentId ? { studentId } : {}),
      ...(malId ? { malId } : {}),
    },
    include: { student: true, mal: { select: { id: true, name: true } } },
    orderBy: { dato: "desc" },
  });

  return NextResponse.json({
    tekster: tekster.map((t) => ({
      id: t.id,
      studentId: t.studentId,
      studentName: t.student.label,
      malId: t.malId,
      malName: t.mal.name,
      tittel: t.tittel,
      score: t.score,
      karakter: t.karakter,
      dato: t.dato.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = elevTekstCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const classStudent = await prisma.classStudent.findUnique({
    where: { id: parsed.data.classStudentId },
    include: { classProfile: true },
  });
  if (
    !classStudent ||
    classStudent.classProfileId !== parsed.data.classId ||
    classStudent.classProfile.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "Fant ikke eleven i klassen" }, { status: 404 });
  }

  const mal = await prisma.vurderingsMal.findUnique({ where: { id: parsed.data.malId } });
  if (!mal || mal.userId !== session.user.id) {
    return NextResponse.json({ error: "Fant ikke vurderingsmalen" }, { status: 404 });
  }

  const studentId = await resolveStudentLink(classStudent, session.user.id);

  const parsedDato = parsed.data.dato ? new Date(parsed.data.dato) : new Date();
  const dato = Number.isNaN(parsedDato.getTime()) ? new Date() : parsedDato;
  const score = parsed.data.score ?? null;
  const karakter = resolveKarakter(score, mal.skala as unknown as SkalaEntry[]);

  const tekst = await prisma.elevTekst.create({
    data: {
      userId: session.user.id,
      studentId,
      classStudentId: classStudent.id,
      malId: mal.id,
      tittel: parsed.data.tittel,
      tekst: parsed.data.tekst,
      score,
      karakter,
      tilbakemelding: parsed.data.tilbakemelding,
      dato,
    },
    include: { student: true, mal: { select: { id: true, name: true, skala: true } } },
  });

  return NextResponse.json({
    tekst: {
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
      kriterieVurdering: tekst.kriterieVurdering,
      skala: tekst.mal.skala,
      dato: tekst.dato.toISOString(),
      updatedAt: tekst.updatedAt.toISOString(),
    },
  });
}
