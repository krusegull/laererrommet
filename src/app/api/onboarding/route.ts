import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldige opplysninger" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { ...parsed.data, onboarded: true },
  });

  return NextResponse.json({ ok: true });
}
