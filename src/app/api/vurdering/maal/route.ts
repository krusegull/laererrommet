import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maalUpsertSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = maalUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const [student, mal] = await Promise.all([
    prisma.student.findUnique({ where: { id: parsed.data.studentId } }),
    prisma.vurderingsMal.findUnique({ where: { id: parsed.data.malId } }),
  ]);
  if (!student || student.userId !== session.user.id) {
    return NextResponse.json({ error: "Fant ikke eleven" }, { status: 404 });
  }
  if (!mal || mal.userId !== session.user.id) {
    return NextResponse.json({ error: "Fant ikke vurderingsmalen" }, { status: 404 });
  }

  const maal = await prisma.maal.upsert({
    where: { studentId_malId: { studentId: parsed.data.studentId, malId: parsed.data.malId } },
    create: {
      userId: session.user.id,
      studentId: parsed.data.studentId,
      malId: parsed.data.malId,
      elevMaal: parsed.data.elevMaal,
      laererMaal: parsed.data.laererMaal,
      notat: parsed.data.notat,
    },
    update: {
      elevMaal: parsed.data.elevMaal,
      laererMaal: parsed.data.laererMaal,
      notat: parsed.data.notat,
    },
  });

  return NextResponse.json({
    maal: { elevMaal: maal.elevMaal, laererMaal: maal.laererMaal, notat: maal.notat },
  });
}
