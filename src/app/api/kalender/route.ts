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
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toISOString(),
      location: e.location,
      category: e.category,
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

  const event = await prisma.calendarEvent.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category,
    },
  });
}
