import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kriterierUpdateSchema } from "@/lib/validations";
import { getOwnedMal } from "@/lib/vurdering/getOwnedMal";

export async function PUT(request: Request, { params }: { params: Promise<{ malId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { malId } = await params;
  const mal = await getOwnedMal(malId, session.user.id);
  if (!mal) {
    return NextResponse.json({ error: "Fant ikke vurderingsmalen" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = kriterierUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const existingIds = new Set(mal.kriterier.map((k) => k.id));
  const incomingIds = new Set(parsed.data.kriterier.filter((k) => k.id).map((k) => k.id as string));
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  await prisma.$transaction([
    ...(toDelete.length > 0 ? [prisma.vurderingsKriterium.deleteMany({ where: { id: { in: toDelete } } })] : []),
    ...parsed.data.kriterier.map((k, index) =>
      k.id && existingIds.has(k.id)
        ? prisma.vurderingsKriterium.update({
            where: { id: k.id },
            data: { name: k.name, description: k.description, weight: k.weight, ekstraBra: k.ekstraBra, order: index },
          })
        : prisma.vurderingsKriterium.create({
            data: {
              malId,
              name: k.name,
              description: k.description,
              weight: k.weight,
              ekstraBra: k.ekstraBra,
              order: index,
            },
          })
    ),
  ]);

  const kriterier = await prisma.vurderingsKriterium.findMany({ where: { malId }, orderBy: { order: "asc" } });

  return NextResponse.json({
    kriterier: kriterier.map((k) => ({
      id: k.id,
      name: k.name,
      description: k.description,
      weight: k.weight,
      ekstraBra: k.ekstraBra,
    })),
  });
}
