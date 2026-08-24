import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema, deleteAccountSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  if (parsed.data.email) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Det finnes allerede en konto med denne e-postadressen" },
        { status: 409 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      school: user.school,
      subject: user.subject,
      grade: user.grade,
      bio: user.bio,
      isPublic: user.isPublic,
      darkMode: user.darkMode,
      notifyChat: user.notifyChat,
      notifyLikes: user.notifyLikes,
      notifyCalendar: user.notifyCalendar,
      notifyKI: user.notifyKI,
      notifyEmail: user.notifyEmail,
    },
  });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Passord er påkrevd for å slette kontoen" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Fant ikke brukeren" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Feil passord" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ ok: true });
}
