import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weeklyNoteSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekStartParam = searchParams.get("weekStart");
  if (!weekStartParam) {
    return NextResponse.json({ error: "Mangler weekStart" }, { status: 400 });
  }
  const weekStart = new Date(weekStartParam);
  if (Number.isNaN(weekStart.getTime())) {
    return NextResponse.json({ error: "Ugyldig weekStart" }, { status: 400 });
  }

  const notes = await prisma.weeklyNote.findMany({
    where: { userId: session.user.id, weekStart },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({
    notes: notes.map((n) => ({
      id: n.id,
      dayOfWeek: n.dayOfWeek,
      content: n.content,
      priority: n.priority,
    })),
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = weeklyNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const { weekStart, dayOfWeek, content, priority } = parsed.data;

  if (!content) {
    await prisma.weeklyNote.deleteMany({
      where: { userId: session.user.id, weekStart, dayOfWeek },
    });
    return NextResponse.json({ note: null });
  }

  const note = await prisma.weeklyNote.upsert({
    where: { userId_weekStart_dayOfWeek: { userId: session.user.id, weekStart, dayOfWeek } },
    create: { userId: session.user.id, weekStart, dayOfWeek, content, priority: priority ?? null },
    update: { content, priority: priority ?? null },
  });

  return NextResponse.json({
    note: { id: note.id, dayOfWeek: note.dayOfWeek, content: note.content, priority: note.priority },
  });
}
