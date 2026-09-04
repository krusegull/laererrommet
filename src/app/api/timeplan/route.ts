import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timetableEntrySchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const entries = await prisma.timetableEntry.findMany({
    where: { userId: session.user.id },
    include: { subject: { select: { id: true, name: true, colorIndex: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime,
      endTime: e.endTime,
      title: e.title,
      notes: e.notes,
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

  const entry = await prisma.timetableEntry.create({
    data: { ...parsed.data, userId: session.user.id },
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
