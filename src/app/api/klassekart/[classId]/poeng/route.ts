import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { elevPoengSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import { resolveStudentLink } from "@/lib/vurdering/resolveStudentLink";

/**
 * GET: klassens siste tildelinger (gruppert per batch) og poengsum per
 * klassekart-elev i valgt fag (?fag=...), valgfritt filtrert på tema (?tema=...).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  const fag = request.nextUrl.searchParams.get("fag") ?? undefined;
  const tema = request.nextUrl.searchParams.get("tema") ?? undefined;

  // Poengene ligger på den delte elevprofilen. Summen for en klassekart-elev
  // er derfor alle elevens poeng i faget (også fra andre klasser), ikke bare
  // poeng gitt via denne klassen.
  const linked = classProfile.students.filter((s) => s.studentId);
  const studentIds = linked.map((s) => s.studentId as string);

  const sums = studentIds.length
    ? await prisma.elevPoeng.groupBy({
        by: ["studentId"],
        where: { userId: session.user.id, studentId: { in: studentIds }, ...(fag ? { fag } : {}), ...(tema ? { tema } : {}) },
        _sum: { poeng: true },
      })
    : [];
  const sumByStudent = new Map(sums.map((s) => [s.studentId, s._sum.poeng ?? 0]));
  const totals: Record<string, number> = {};
  for (const cs of linked) totals[cs.id] = sumByStudent.get(cs.studentId as string) ?? 0;

  const recentRows = await prisma.elevPoeng.findMany({
    where: { userId: session.user.id, classProfileId: classId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { student: { select: { label: true } } },
  });

  const batches = new Map<
    string,
    { batchId: string; fag: string; poeng: number; tema: string; kilde: string; gruppe: string | null; dato: string; elever: string[] }
  >();
  for (const r of recentRows) {
    let b = batches.get(r.batchId);
    if (!b) {
      if (batches.size >= 15) continue;
      b = { batchId: r.batchId, fag: r.fag, poeng: r.poeng, tema: r.tema, kilde: r.kilde, gruppe: r.gruppe, dato: r.dato.toISOString(), elever: [] };
      batches.set(r.batchId, b);
    }
    b.elever.push(r.student.label);
  }

  const temaRows = await prisma.elevPoeng.findMany({
    where: { userId: session.user.id, ...(fag ? { fag } : {}) },
    distinct: ["tema"],
    select: { tema: true },
    orderBy: { tema: "asc" },
    take: 50,
  });

  return NextResponse.json({ totals, recent: [...batches.values()], temaer: temaRows.map((t) => t.tema) });
}

/** POST: gi plusspoeng til én eller flere klassekart-elever (f.eks. en gruppe). */
export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = elevPoengSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" }, { status: 400 });
  }
  const { classStudentIds, fag, poeng, tema, kilde, gruppe, dato } = parsed.data;

  const byId = new Map(classProfile.students.map((s) => [s.id, s]));
  const unique = [...new Set(classStudentIds)];
  if (unique.some((id) => !byId.has(id))) {
    return NextResponse.json({ error: "Fant ikke eleven" }, { status: 404 });
  }

  // Hver klassekart-elev kobles til (eller får) en delt elevprofil, slik at
  // poengene havner under eleven i elevoversikten.
  const studentIds: string[] = [];
  for (const id of unique) {
    studentIds.push(await resolveStudentLink(byId.get(id)!, session.user.id));
  }

  const batchId = randomUUID();
  // Dato uten klokkeslett lagres midt på dagen (UTC) så den ikke glir over
  // til dagen før/etter når den vises i norsk tid.
  const when = dato ? new Date(dato + "T12:00:00Z") : new Date();

  await prisma.elevPoeng.createMany({
    data: [...new Set(studentIds)].map((studentId) => ({
      userId: session.user.id,
      studentId,
      classProfileId: classId,
      fag,
      poeng,
      tema,
      kilde,
      gruppe: gruppe || null,
      batchId,
      dato: when,
    })),
  });

  return NextResponse.json({ batchId, count: unique.length }, { status: 201 });
}

/** DELETE ?batch=<batchId>: angre en hel tildeling. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  const batchId = request.nextUrl.searchParams.get("batch");
  if (!batchId) {
    return NextResponse.json({ error: "Mangler tildeling" }, { status: 400 });
  }

  const { count } = await prisma.elevPoeng.deleteMany({
    where: { batchId, userId: session.user.id, classProfileId: classId },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Fant ikke tildelingen" }, { status: 404 });
  }
  return NextResponse.json({ deleted: count });
}
