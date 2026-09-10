import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weeklyNoteCreateSchema } from "@/lib/validations";

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
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    notes: notes.map((n) => ({
      id: n.id,
      dayOfWeek: n.dayOfWeek,
      content: n.content,
      priority: n.priority,
      completed: n.completed,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = weeklyNoteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const { weekStart, dayOfWeek, content, priority } = parsed.data;

  const note = await prisma.weeklyNote.create({
    data: { userId: session.user.id, weekStart, dayOfWeek, content, priority: priority ?? null },
  });

  return NextResponse.json({
    note: {
      id: note.id,
      dayOfWeek: note.dayOfWeek,
      content: note.content,
      priority: note.priority,
      completed: note.completed,
    },
  });
}
