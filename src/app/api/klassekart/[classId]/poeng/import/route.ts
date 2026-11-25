import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { elevPoengImportSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import { resolveStudentLink } from "@/lib/vurdering/resolveStudentLink";

/**
 * POST: lagre poeng fra en konkurranse. Hver elev kan få ulikt antall poeng,
 * men alt lagres som én tildeling (samme batchId) så det kan angres samlet.
 */
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
  const parsed = elevPoengImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" }, { status: 400 });
  }
  const { fag, tema, kilde, dato, rader } = parsed.data;

  const byId = new Map(classProfile.students.map((s) => [s.id, s]));
  if (rader.some((r) => !byId.has(r.classStudentId))) {
    return NextResponse.json({ error: "Fant ikke eleven" }, { status: 404 });
  }
  if (new Set(rader.map((r) => r.classStudentId)).size !== rader.length) {
    return NextResponse.json({ error: "Samme elev står flere ganger" }, { status: 400 });
  }

  const batchId = randomUUID();
  const when = dato ? new Date(dato + "T12:00:00Z") : new Date();
  const data = [];
  for (const r of rader) {
    if (r.poeng === 0) continue;
    const studentId = await resolveStudentLink(byId.get(r.classStudentId)!, session.user.id);
    data.push({
      userId: session.user.id,
      studentId,
      classProfileId: classId,
      fag,
      poeng: r.poeng,
      tema,
      kilde,
      gruppe: r.gruppe || null,
      batchId,
      dato: when,
    });
  }
  if (data.length === 0) {
    return NextResponse.json({ error: "Alle elevene har 0 poeng" }, { status: 400 });
  }

  await prisma.elevPoeng.createMany({ data });
  return NextResponse.json({ batchId, count: data.length }, { status: 201 });
}
