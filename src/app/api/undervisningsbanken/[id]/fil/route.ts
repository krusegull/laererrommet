import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const plan = await prisma.lessonPlan.findUnique({
    where: { id },
    select: { fileData: true, fileName: true, fileType: true },
  });

  if (!plan?.fileData || !plan.fileName) {
    return NextResponse.json({ error: "Fant ingen fil" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(plan.fileData), {
    headers: {
      "Content-Type": plan.fileType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(plan.fileName)}"`,
    },
  });
}
