import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { chartCreateSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import { getOwnedChart } from "@/lib/klassekart/getOwnedChart";

export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = chartCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  let source: { roomObjects: Prisma.JsonValue; podLayout: Prisma.JsonValue; pods: Prisma.JsonValue; locks: Prisma.JsonValue; pairHistory: Prisma.JsonValue; grupper: Prisma.JsonValue } | null = null;
  if (parsed.data.cloneFromChartId) {
    const cloneFrom = await getOwnedChart(classId, parsed.data.cloneFromChartId, session.user.id);
    if (!cloneFrom) {
      return NextResponse.json({ error: "Fant ikke klassekartet som skal dupliseres" }, { status: 404 });
    }
    source = cloneFrom;
  }

  const label =
    parsed.data.label ?? (parsed.data.week ? `Uke ${parsed.data.week}` : "Nytt klassekart");

  const chart = await prisma.seatingChart.create({
    data: {
      classProfileId: classId,
      label,
      week: parsed.data.week ?? null,
      year: parsed.data.year ?? null,
      roomObjects: (source?.roomObjects ?? []) as unknown as Prisma.InputJsonValue,
      podLayout: (source?.podLayout ?? []) as unknown as Prisma.InputJsonValue,
      pods: (source?.pods ?? []) as unknown as Prisma.InputJsonValue,
      locks: (source?.locks ?? []) as unknown as Prisma.InputJsonValue,
      pairHistory: (source?.pairHistory ?? {}) as unknown as Prisma.InputJsonValue,
      grupper: (source?.grupper ?? []) as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    chart: {
      id: chart.id,
      label: chart.label,
      week: chart.week,
      year: chart.year,
      updatedAt: chart.updatedAt.toISOString(),
    },
  });
}
