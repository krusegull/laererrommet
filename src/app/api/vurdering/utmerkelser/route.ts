import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { utmerkelseCreateSchema } from "@/lib/validations";
import { resolveStudentLink } from "@/lib/vurdering/resolveStudentLink";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const utmerkelser = await prisma.utmerkelse.findMany({
    where: { userId: session.user.id },
    include: { student: true },
    orderBy: { dato: "desc" },
  });

  return NextResponse.json({
    utmerkelser: utmerkelser.map((u) => ({
      id: u.id,
      studentId: u.studentId,
      studentName: u.student.label,
      kategori: u.kategori,
      begrunnelse: u.begrunnelse,
      dato: u.dato.toISOString(),
      createdAt: u.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = utmerkelseCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const classStudent = await prisma.classStudent.findUnique({
    where: { id: parsed.data.classStudentId },
    include: { classProfile: true },
  });
  if (
    !classStudent ||
    classStudent.classProfileId !== parsed.data.classId ||
    classStudent.classProfile.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "Fant ikke eleven i klassen" }, { status: 404 });
  }

  const studentId = await resolveStudentLink(classStudent, session.user.id);

  const parsedDato = parsed.data.dato ? new Date(parsed.data.dato) : new Date();
  const dato = Number.isNaN(parsedDato.getTime()) ? new Date() : parsedDato;

  const utmerkelse = await prisma.utmerkelse.create({
    data: {
      userId: session.user.id,
      studentId,
      classStudentId: classStudent.id,
      kategori: parsed.data.kategori,
      begrunnelse: parsed.data.begrunnelse,
      dato,
    },
    include: { student: true },
  });

  return NextResponse.json({
    utmerkelse: {
      id: utmerkelse.id,
      studentId: utmerkelse.studentId,
      studentName: utmerkelse.student.label,
      kategori: utmerkelse.kategori,
      begrunnelse: utmerkelse.begrunnelse,
      dato: utmerkelse.dato.toISOString(),
      createdAt: utmerkelse.createdAt.toISOString(),
    },
  });
}
