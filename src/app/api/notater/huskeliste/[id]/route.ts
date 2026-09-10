import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weeklyNoteUpdateSchema } from "@/lib/validations";

async function assertOwnership(id: string, userId: string) {
  const note = await prisma.weeklyNote.findUnique({ where: { id } });
  return note && note.userId === userId ? note : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke notatet" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = weeklyNoteUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const note = await prisma.weeklyNote.update({
    where: { id },
    data: parsed.data,
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Fant ikke notatet" }, { status: 404 });
  }

  await prisma.weeklyNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
