import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { terminlisteEventSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const grade = searchParams.get("grade");

  const events = await prisma.terminlisteEvent.findMany({
    where: grade ? { grade } : {},
    include: { user: { select: { name: true } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toISOString(),
      grade: e.grade,
      authorName: e.user.name,
      isOwner: e.userId === session.user.id,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = terminlisteEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const event = await prisma.terminlisteEvent.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ event: { id: event.id } });
}
