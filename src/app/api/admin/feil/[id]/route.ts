import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/requireAdmin";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const { id } = await params;
  const report = await prisma.errorReport.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Fant ikke rapporten" }, { status: 404 });
  }

  const updated = await prisma.errorReport.update({
    where: { id },
    data: { status: "løst" },
  });

  return NextResponse.json({ report: updated });
}
