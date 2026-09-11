import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importantNoteCreateSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const notes = await prisma.importantNote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    notes: notes.map((n) => ({
      id: n.id,
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
  const parsed = importantNoteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const { content, priority } = parsed.data;

  const note = await prisma.importantNote.create({
    data: { userId: session.user.id, content, priority: priority ?? null },
  });

  return NextResponse.json({
    note: { id: note.id, content: note.content, priority: note.priority, completed: note.completed },
  });
}
