import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/requireAdmin";
import { toggleRealizedSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = toggleRealizedSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldige opplysninger" }, { status: 400 });
  }

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) {
    return NextResponse.json({ error: "Fant ikke ideen" }, { status: 404 });
  }

  const realized = parsed.data.realized ?? !idea.realized;

  const updated = await prisma.idea.update({
    where: { id },
    data: { realized },
  });

  return NextResponse.json({ idea: updated });
}
