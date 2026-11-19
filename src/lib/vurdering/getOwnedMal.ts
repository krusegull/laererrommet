import { prisma } from "@/lib/prisma";

/**
 * Henter en vurderingsmal med kriterier, og bekrefter at den tilhører
 * innlogget bruker. Returnerer null hvis malen ikke finnes eller tilhører
 * noen andre - kall-stedet skal da svare 404, ikke lekke at malen finnes.
 */
export async function getOwnedMal(malId: string, userId: string) {
  const mal = await prisma.vurderingsMal.findUnique({
    where: { id: malId },
    include: { kriterier: { orderBy: { order: "asc" } } },
  });

  if (!mal || mal.userId !== userId) {
    return null;
  }

  return mal;
}
