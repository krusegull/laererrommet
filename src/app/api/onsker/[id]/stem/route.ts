import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  const featureRequest = await prisma.featureRequest.findUnique({ where: { id } });
  if (!featureRequest) {
    return NextResponse.json({ error: "Fant ikke ønsket" }, { status: 404 });
  }

  try {
    await prisma.vote.create({
      data: { userId: session.user.id, featureRequestId: id },
    });
  } catch {
    // Unique-constraint på [userId, featureRequestId] — brukeren har allerede stemt.
    return NextResponse.json({ error: "Du har allerede stemt på dette ønsket" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.vote.deleteMany({
    where: { userId: session.user.id, featureRequestId: id },
  });

  return NextResponse.json({ ok: true });
}
