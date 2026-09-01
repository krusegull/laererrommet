import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calendarSubjectSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const subjects = await prisma.calendarSubject.findMany({
    where: { userId: session.user.id },
    orderBy: { colorIndex: "asc" },
  });

  return NextResponse.json({
    subjects: subjects.map((s) => ({ id: s.id, name: s.name, colorIndex: s.colorIndex })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = calendarSubjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const existingCount = await prisma.calendarSubject.count({ where: { userId: session.user.id } });

  try {
    const subject = await prisma.calendarSubject.create({
      data: { name: parsed.data.name, colorIndex: existingCount, userId: session.user.id },
    });
    return NextResponse.json({
      subject: { id: subject.id, name: subject.name, colorIndex: subject.colorIndex },
    });
  } catch {
    return NextResponse.json({ error: "Du har allerede lagt til dette faget" }, { status: 409 });
  }
}
