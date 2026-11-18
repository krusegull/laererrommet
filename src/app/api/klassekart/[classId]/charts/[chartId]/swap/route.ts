import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { swapSeatSchema } from "@/lib/validations";
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
  const parsed = swapSeatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }
  const { p1, s1, p2, s2, force } = parsed.data;

  const pods = ((chart.pods as unknown as PodSeats | null) ?? []).map((seats) => seats.slice());
  const locks = (chart.locks as unknown as LockEntry[] | null) ?? [];

  if (!pods[p1] || pods[p1][s1] === undefined || !pods[p2] || pods[p2][s2] === undefined) {
    return NextResponse.json({ error: "Fant ikke setet" }, { status: 400 });
  }

  const lock1 = locks.find((l) => l.podIndex === p1 && l.seatIndex === s1);
  const lock2 = locks.find((l) => l.podIndex === p2 && l.seatIndex === s2);

  if ((lock1 || lock2) && !force) {
    const lockedIds = [lock1?.studentId, lock2?.studentId].filter((id): id is string => Boolean(id));
    const lockedStudents = chart.classProfile.students.filter((s) => lockedIds.includes(s.id));
    return NextResponse.json(
      {
        error: "Eleven er låst til denne plassen",
        locked: lockedStudents.map((s) => ({ id: s.id, name: s.name })),
      },
      { status: 409 }
    );
  }

  const tmp = pods[p1][s1];
  pods[p1][s1] = pods[p2][s2];
  pods[p2][s2] = tmp;

  const nextLocks = force
    ? locks.filter((l) => !((l.podIndex === p1 && l.seatIndex === s1) || (l.podIndex === p2 && l.seatIndex === s2)))
    : locks;

  await prisma.seatingChart.update({
    where: { id: chartId },
    data: { pods, locks: nextLocks as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ pods, locks: nextLocks });
}
