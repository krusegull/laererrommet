import { prisma } from "@/lib/prisma";

/**
 * Henter en elevtekst med elev og vurderingsmal, og bekrefter at den
 * tilhører innlogget bruker. Returnerer null hvis den ikke finnes eller
 * tilhører noen andre - kall-stedet skal da svare 404, ikke lekke at den
 * finnes.
 */
export async function getOwnedElevTekst(tekstId: string, userId: string) {
  const tekst = await prisma.elevTekst.findUnique({
    where: { id: tekstId },
    include: {
      student: true,
      mal: { include: { kriterier: { orderBy: { order: "asc" } } } },
      kommentarer: { orderBy: { startOffset: "asc" } },
    },
  });

  if (!tekst || tekst.userId !== userId) {
    return null;
  }

  return tekst;
}
