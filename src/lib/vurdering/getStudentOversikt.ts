import { prisma } from "@/lib/prisma";
import type { SkalaEntry } from "./types";

export interface MalOversikt {
  malId: string;
  malName: string;
  skala: SkalaEntry[];
  entries: { dato: string; score: number; karakter: string | null }[];
  /** Snitt poengsum blant ALLE elever denne læreren har vurdert for denne malen (inkl. denne eleven). */
  cohortAverage: number | null;
  maal: { elevMaal: string | null; laererMaal: string | null; notat: string | null } | null;
}

/**
 * Henter vurderingsutvikling for én elev, gruppert per vurderingsmal -
 * grunnlaget for utviklingsgrafen og mål-sammenligningen på elevprofilen.
 * Kun vurderte elevtekster (score satt) tas med.
 */
export async function getStudentOversikt(studentId: string, userId: string): Promise<MalOversikt[]> {
  const elevTekster = await prisma.elevTekst.findMany({
    where: { studentId, userId, score: { not: null } },
    select: {
      malId: true,
      score: true,
      karakter: true,
      dato: true,
      mal: { select: { name: true, skala: true } },
    },
    orderBy: { dato: "asc" },
  });

  const malIds = [...new Set(elevTekster.map((t) => t.malId))];
  if (malIds.length === 0) return [];

  const [cohortAverages, maalRows] = await Promise.all([
    prisma.elevTekst.groupBy({
      by: ["malId"],
      where: { userId, malId: { in: malIds }, score: { not: null } },
      _avg: { score: true },
    }),
    prisma.maal.findMany({ where: { studentId, malId: { in: malIds } } }),
  ]);
  const avgByMal = new Map(cohortAverages.map((c) => [c.malId, c._avg.score]));
  const maalByMal = new Map(maalRows.map((m) => [m.malId, m]));

  const grouped = new Map<string, MalOversikt>();
  for (const t of elevTekster) {
    if (!grouped.has(t.malId)) {
      grouped.set(t.malId, {
        malId: t.malId,
        malName: t.mal.name,
        skala: t.mal.skala as unknown as SkalaEntry[],
        entries: [],
        cohortAverage: avgByMal.get(t.malId) ?? null,
        maal: maalByMal.has(t.malId)
          ? {
              elevMaal: maalByMal.get(t.malId)!.elevMaal,
              laererMaal: maalByMal.get(t.malId)!.laererMaal,
              notat: maalByMal.get(t.malId)!.notat,
            }
          : null,
      });
    }
    grouped.get(t.malId)!.entries.push({ dato: t.dato.toISOString(), score: t.score as number, karakter: t.karakter });
  }

  return [...grouped.values()];
}
