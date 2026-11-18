import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classProfileCreateSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const classes = await prisma.classProfile.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { students: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    classes: classes.map((c) => ({ id: c.id, name: c.name, studentCount: c._count.students })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = classProfileCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const classProfile = await prisma.classProfile.create({
    data: {
      name: parsed.data.name,
      userId: session.user.id,
      seatingCharts: { create: {} },
    },
  });

  return NextResponse.json({ class: { id: classProfile.id, name: classProfile.name, studentCount: 0 } });
}
