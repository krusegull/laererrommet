import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timetableEntrySchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.timetableEntry.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke timeplanoppføringen" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Du har ikke tilgang til denne oppføringen" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = timetableEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  if (parsed.data.subjectId) {
    const subject = await prisma.calendarSubject.findUnique({
      where: { id: parsed.data.subjectId },
      select: { userId: true },
    });
    if (!subject || subject.userId !== session.user.id) {
      return NextResponse.json({ error: "Fant ikke faget" }, { status: 400 });
    }
  }

  const entry = await prisma.timetableEntry.update({
    where: { id },
    data: { ...parsed.data, subjectId: parsed.data.subjectId ?? null },
    include: { subject: { select: { id: true, name: true, colorIndex: true } } },
  });

  return NextResponse.json({
    entry: {
      id: entry.id,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      title: entry.title,
      notes: entry.notes,
      subject: entry.subject,
    },
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.timetableEntry.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke timeplanoppføringen" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Du har ikke tilgang til denne oppføringen" }, { status: 403 });
  }

  await prisma.timetableEntry.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
