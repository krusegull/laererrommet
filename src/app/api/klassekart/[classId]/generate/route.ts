import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import { generateSeating } from "@/lib/klassekart/seating";
import type { LockEntry, Pod } from "@/lib/klassekart/types";

export async function POST(_request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  const podLayout = (classProfile.seatingChart?.podLayout as Pod[] | null) ?? [];
  if (podLayout.length === 0) {
    return NextResponse.json({ error: "Legg til pultgrupper før du genererer et klassekart" }, { status: 400 });
  }

  const students = classProfile.students.map((s) => ({ id: s.id, name: s.name, gender: s.gender as "gutt" | "jente" }));
  const existingLocks = (classProfile.seatingChart?.locks as LockEntry[] | null) ?? [];
  const { pods, locks } = generateSeating(students, podLayout, existingLocks);

  await prisma.seatingChart.update({
    where: { classProfileId: classId },
    data: { pods, locks: locks as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ pods, locks });
}
