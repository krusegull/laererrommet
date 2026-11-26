import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fagPoengCreateSchema } from "@/lib/validations";
import { resolveStudentLink } from "@/lib/vurdering/resolveStudentLink";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "Mangler studentId" }, { status: 400 });
  }

  const fagPoeng = await prisma.fagPoeng.findMany({
    where: { userId: session.user.id, studentId },
    orderBy: { dato: "desc" },
  });

  return NextResponse.json({
    fagPoeng: fagPoeng.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      fag: p.fag,
      poeng: p.poeng,
      kilde: p.kilde,
      dato: p.dato.toISOString(),
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = fagPoengCreateSchema.safeParse(body);
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

  const fagPoeng = await prisma.fagPoeng.create({
    data: {
      userId: session.user.id,
      studentId,
      fag: parsed.data.fag,
      poeng: parsed.data.poeng,
      kilde: parsed.data.kilde,
      dato,
    },
  });

  return NextResponse.json({
    fagPoeng: {
      id: fagPoeng.id,
      studentId: fagPoeng.studentId,
      fag: fagPoeng.fag,
      poeng: fagPoeng.poeng,
      kilde: fagPoeng.kilde,
      dato: fagPoeng.dato.toISOString(),
      createdAt: fagPoeng.createdAt.toISOString(),
    },
  });
}
