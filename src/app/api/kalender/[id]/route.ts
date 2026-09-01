import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calendarEventSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.calendarEvent.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke hendelsen" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Du har ikke tilgang til denne hendelsen" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = calendarEventSchema.safeParse(body);
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

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...parsed.data,
      subjectId: parsed.data.subjectId ?? null,
      endDate: parsed.data.endDate ?? null,
      reminderSent: false,
    },
    include: { subject: { select: { id: true, name: true, colorIndex: true } } },
  });

  return NextResponse.json({
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
      location: event.location,
      category: event.category,
      subject: event.subject,
    },
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.calendarEvent.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke hendelsen" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Du har ikke tilgang til denne hendelsen" }, { status: 403 });
  }

  await prisma.calendarEvent.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
