import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classProfileUpdateSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";

export async function GET(_request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  return NextResponse.json({
    class: {
      id: classProfile.id,
      name: classProfile.name,
      students: classProfile.students.map((s) => ({ id: s.id, name: s.name, gender: s.gender })),
      roomObjects: classProfile.seatingChart?.roomObjects ?? [],
      podLayout: classProfile.seatingChart?.podLayout ?? [],
      pods: classProfile.seatingChart?.pods ?? [],
      locks: classProfile.seatingChart?.locks ?? [],
      pairHistory: classProfile.seatingChart?.pairHistory ?? {},
      grupper: classProfile.seatingChart?.grupper ?? [],
      updatedAt: classProfile.seatingChart?.updatedAt?.toISOString() ?? null,
    },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ classId: string }> }) {
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
  const parsed = classProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const updated = await prisma.classProfile.update({
    where: { id: classId },
    data: { name: parsed.data.name },
  });

  return NextResponse.json({ class: { id: updated.id, name: updated.name } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  await prisma.classProfile.delete({ where: { id: classId } });

  return NextResponse.json({ ok: true });
}
