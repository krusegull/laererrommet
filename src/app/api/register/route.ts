import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Ugyldige opplysninger";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Det finnes allerede en konto med denne e-postadressen" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  return NextResponse.json({ ok: true });
}
