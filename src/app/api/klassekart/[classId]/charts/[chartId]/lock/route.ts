import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { toggleLockSchema } from "@/lib/validations";
import { getOwnedChart } from "@/lib/klassekart/getOwnedChart";
import type { LockEntry, PodSeats } from "@/lib/klassekart/types";

export async function POST(
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
  const parsed = toggleLockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }
  const { podIndex, seatIndex } = parsed.data;

  const pods = (chart.pods as unknown as PodSeats | null) ?? [];
  const occupantId = pods[podIndex]?.[seatIndex];
  if (!occupantId) {
    return NextResponse.json({ error: "Tomt sete kan ikke låses" }, { status: 400 });
  }

  const locks = (chart.locks as unknown as LockEntry[] | null) ?? [];
  const existing = locks.find((l) => l.podIndex === podIndex && l.seatIndex === seatIndex);
  const wasLockedHere = existing && existing.studentId === occupantId;

  const nextLocks = locks.filter((l) => l.studentId !== occupantId);
  if (!wasLockedHere) {
    nextLocks.push({ studentId: occupantId, podIndex, seatIndex });
  }

  await prisma.seatingChart.update({
    where: { id: chartId },
    data: { locks: nextLocks as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ locks: nextLocks });
}
