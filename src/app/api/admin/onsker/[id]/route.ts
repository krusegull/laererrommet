import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/requireAdmin";
import { featureRequestStatusSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = featureRequestStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }

  const featureRequest = await prisma.featureRequest.findUnique({ where: { id } });
  if (!featureRequest) {
    return NextResponse.json({ error: "Fant ikke ønsket" }, { status: 404 });
  }

  const updated = await prisma.featureRequest.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ request: updated });
}
