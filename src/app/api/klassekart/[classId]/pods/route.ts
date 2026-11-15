import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { podLayoutUpdateSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import { generateSeating } from "@/lib/klassekart/seating";
import type { LockEntry } from "@/lib/klassekart/types";

export async function PUT(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = podLayoutUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  if (parsed.data.regenerate === false) {
    await prisma.seatingChart.update({
      where: { classProfileId: classId },
      data: { podLayout: parsed.data.podLayout },
    });
    return NextResponse.json({
      podLayout: parsed.data.podLayout,
      pods: classProfile.seatingChart?.pods ?? [],
      locks: classProfile.seatingChart?.locks ?? [],
    });
  }

  // Antall/størrelse på pultgrupper er endret - genererer kartet på nytt for
  // det nye oppsettet, akkurat som når læreren klikker "Generer nytt kart".
  const students = classProfile.students.map((s) => ({ id: s.id, name: s.name, gender: s.gender as "gutt" | "jente" }));
  const existingLocks = (classProfile.seatingChart?.locks as LockEntry[] | null) ?? [];
  const { pods, locks } = generateSeating(students, parsed.data.podLayout, existingLocks);

  await prisma.seatingChart.update({
    where: { classProfileId: classId },
    data: { podLayout: parsed.data.podLayout, pods, locks: locks as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ podLayout: parsed.data.podLayout, pods, locks });
}
