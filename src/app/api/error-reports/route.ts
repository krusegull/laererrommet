import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorReportSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = errorReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig rapport" }, { status: 400 });
  }

  await prisma.errorReport.create({
    data: { userId: session.user.id, ...parsed.data },
  });

  return NextResponse.json({ ok: true });
}
