import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { featureRequestSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const requests = await prisma.featureRequest.findMany({
    include: { votes: true, user: { select: { name: true } } },
  });

  const data = requests
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status,
      authorName: r.user.name,
      createdAt: r.createdAt.toISOString(),
      voteCount: r.votes.length,
      hasVoted: r.votes.some((v) => v.userId === session.user.id),
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  return NextResponse.json({ requests: data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = featureRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const featureRequest = await prisma.featureRequest.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ request: featureRequest });
}
