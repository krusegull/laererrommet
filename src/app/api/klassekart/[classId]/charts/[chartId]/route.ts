import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chartUpdateSchema } from "@/lib/validations";
import { getOwnedChart } from "@/lib/klassekart/getOwnedChart";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string; chartId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId, chartId } = await params;
  const chart = await getOwnedChart(classId, chartId, session.user.id);
  if (!chart) {
    return NextResponse.json({ error: "Fant ikke klassekartet" }, { status: 404 });
  }

  return NextResponse.json({
    chart: {
      id: chart.id,
      label: chart.label,
      week: chart.week,
      year: chart.year,
      roomObjects: chart.roomObjects,
      podLayout: chart.podLayout,
      pods: chart.pods,
      locks: chart.locks,
      pairHistory: chart.pairHistory,
      grupper: chart.grupper,
      updatedAt: chart.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ classId: string; chartId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId, chartId } = await params;
  const chart = await getOwnedChart(classId, chartId, session.user.id);
  if (!chart) {
    return NextResponse.json({ error: "Fant ikke klassekartet" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = chartUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const updated = await prisma.seatingChart.update({
    where: { id: chartId },
    data: {
      ...(parsed.data.label !== undefined ? { label: parsed.data.label } : {}),
      ...(parsed.data.week !== undefined ? { week: parsed.data.week } : {}),
      ...(parsed.data.year !== undefined ? { year: parsed.data.year } : {}),
    },
  });

  return NextResponse.json({
    chart: {
      id: updated.id,
      label: updated.label,
      week: updated.week,
      year: updated.year,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ classId: string; chartId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId, chartId } = await params;
  const chart = await getOwnedChart(classId, chartId, session.user.id);
  if (!chart) {
    return NextResponse.json({ error: "Fant ikke klassekartet" }, { status: 404 });
  }

  const chartCount = await prisma.seatingChart.count({ where: { classProfileId: classId } });
  if (chartCount <= 1) {
    return NextResponse.json(
      { error: "Kan ikke slette det eneste klassekartet - klassen må ha minst ett." },
      { status: 400 }
    );
  }

  await prisma.seatingChart.delete({ where: { id: chartId } });

  return NextResponse.json({ ok: true });
}
