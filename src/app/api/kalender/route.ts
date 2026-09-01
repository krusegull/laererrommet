import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calendarEventSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const events = await prisma.calendarEvent.findMany({
    where: {
      userId: session.user.id,
      ...(start && end ? { date: { gte: new Date(start), lt: new Date(end) } } : {}),
    },
    include: { subject: { select: { id: true, name: true, colorIndex: true } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toISOString(),
      endDate: e.endDate ? e.endDate.toISOString() : null,
      location: e.location,
      category: e.category,
      subject: e.subject,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
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

  const event = await prisma.calendarEvent.create({
    data: { ...parsed.data, userId: session.user.id },
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
