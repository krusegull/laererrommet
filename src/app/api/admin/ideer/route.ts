import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/requireAdmin";
import { ideaSchema } from "@/lib/validations";

export async function GET() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const ideas = await prisma.idea.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ideas });
}

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ideaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const idea = await prisma.idea.create({ data: parsed.data });
  return NextResponse.json({ idea });
}
