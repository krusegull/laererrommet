import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomObjectsUpdateSchema } from "@/lib/validations";
import { getOwnedChart } from "@/lib/klassekart/getOwnedChart";

export async function PUT(
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
  const parsed = roomObjectsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  await prisma.seatingChart.update({
    where: { id: chartId },
    data: { roomObjects: parsed.data.roomObjects },
  });

  return NextResponse.json({ roomObjects: parsed.data.roomObjects });
}
