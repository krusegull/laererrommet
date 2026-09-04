import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schoolBreakSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const breaks = await prisma.schoolBreak.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({
    breaks: breaks.map((b) => ({
      id: b.id,
      name: b.name,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schoolBreakSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const schoolBreak = await prisma.schoolBreak.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({
    schoolBreak: {
      id: schoolBreak.id,
      name: schoolBreak.name,
      startDate: schoolBreak.startDate.toISOString(),
      endDate: schoolBreak.endDate.toISOString(),
    },
  });
}
