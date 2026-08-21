import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plan = await prisma.lessonPlan.findUnique({ where: { id } });

  if (!plan) {
    return NextResponse.json({ error: "Fant ikke opplegget" }, { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(UPLOAD_DIR, plan.filePath));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": plan.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(plan.fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Filen ble ikke funnet på disk" }, { status: 404 });
  }
}
