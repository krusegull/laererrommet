import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { privateNoteSchema } from "@/lib/validations";

// SIKKERHET: Alle spørringer her er alltid scopet til session.user.id.
// Vi stoler aldri på en userId fra klienten — kun den innloggede brukerens
// egen sesjon avgjør hvilke notater som hentes, opprettes eller slettes.

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const notes = await prisma.privateNote.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = privateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const note = await prisma.privateNote.create({
    data: { userId: session.user.id, ...parsed.data },
  });

  return NextResponse.json({ note });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mangler ID" }, { status: 400 });
  }

  const note = await prisma.privateNote.findUnique({ where: { id } });
  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: "Fant ikke notatet" }, { status: 404 });
  }

  await prisma.privateNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
