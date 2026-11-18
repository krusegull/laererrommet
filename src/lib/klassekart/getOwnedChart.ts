import { prisma } from "@/lib/prisma";

/**
 * Henter ett spesifikt klassekart med full data (rom, pulter, seter osv.),
 * sammen med klassen det hører til (elever og eierskap). Bekrefter at kartet
 * faktisk hører til den oppgitte klassen, og at klassen tilhører innlogget
 * bruker - kall-stedet skal svare 404 på null, ikke lekke at kartet finnes.
 */
export async function getOwnedChart(classId: string, chartId: string, userId: string) {
  const chart = await prisma.seatingChart.findUnique({
    where: { id: chartId },
    include: {
      classProfile: {
        include: { students: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!chart || chart.classProfileId !== classId) {
    return null;
  }
  if (chart.classProfile.userId !== userId) {
    return null;
  }

  return chart;
}
