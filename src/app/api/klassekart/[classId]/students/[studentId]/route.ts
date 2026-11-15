import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { classStudentSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import type { Grupper, LockEntry, PodSeats } from "@/lib/klassekart/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId, studentId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }
  if (!classProfile.students.some((s) => s.id === studentId)) {
    return NextResponse.json({ error: "Fant ikke eleven" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = classStudentSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const student = await prisma.classStudent.update({
    where: { id: studentId },
    data: parsed.data,
  });

  return NextResponse.json({ student: { id: student.id, name: student.name, gender: student.gender } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId, studentId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }
  if (!classProfile.students.some((s) => s.id === studentId)) {
    return NextResponse.json({ error: "Fant ikke eleven" }, { status: 404 });
  }

  await prisma.classStudent.delete({ where: { id: studentId } });

  const chart = classProfile.seatingChart;
  if (chart) {
    const pods = (chart.pods as PodSeats | null) ?? [];
    const locks = (chart.locks as LockEntry[] | null) ?? [];
    const grupper = (chart.grupper as Grupper | null) ?? [];

    const cleanedPods = pods.map((seats) => seats.map((id) => (id === studentId ? null : id)));
    const cleanedLocks = locks.filter((l) => l.studentId !== studentId);
    const cleanedGrupper = grupper.map((group) => group.filter((id) => id !== studentId));

    await prisma.seatingChart.update({
      where: { classProfileId: classId },
      data: {
        pods: cleanedPods,
        locks: cleanedLocks as unknown as Prisma.InputJsonValue,
        grupper: cleanedGrupper,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
