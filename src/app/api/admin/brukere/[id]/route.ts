import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/requireAdmin";
import { updateRoleSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Du kan ikke endre din egen rolle" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig rolle" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Fant ikke brukeren" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({
    user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
  });
}
