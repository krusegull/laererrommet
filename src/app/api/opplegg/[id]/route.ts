import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plan = await prisma.lessonPlan.findUnique({ where: { id } });

  if (!plan) {
    return NextResponse.json({ error: "Fant ikke opplegget" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(plan.fileData), {
    headers: {
      "Content-Type": plan.fileType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(plan.fileName)}"`,
    },
  });
}
