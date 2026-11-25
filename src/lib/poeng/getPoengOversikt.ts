import { prisma } from "@/lib/prisma";
import { compareFag } from "@/lib/poeng/fag";
import type { FagOversikt } from "@/lib/poeng/types";

/** Elevens poeng samlet per fag, med sum per tema og alle registreringer (nyeste først). */
export async function getPoengOversikt(studentId: string, userId: string): Promise<FagOversikt[]> {
  const rows = await prisma.elevPoeng.findMany({
    where: { studentId, userId },
    orderBy: [{ dato: "desc" }, { createdAt: "desc" }],
    include: { classProfile: { select: { name: true } } },
  });

  const byFag = new Map<string, FagOversikt>();
  for (const r of rows) {
    let f = byFag.get(r.fag);
    if (!f) {
      f = { fag: r.fag, sum: 0, antall: 0, temaer: [], rader: [] };
      byFag.set(r.fag, f);
    }
    f.sum += r.poeng;
    f.antall += 1;
    const t = f.temaer.find((x) => x.tema === r.tema);
    if (t) t.sum += r.poeng;
    else f.temaer.push({ tema: r.tema, sum: r.poeng });
    f.rader.push({
      id: r.id,
      fag: r.fag,
      poeng: r.poeng,
      tema: r.tema,
      kilde: r.kilde,
      gruppe: r.gruppe,
      dato: r.dato.toISOString(),
      klasse: r.classProfile?.name ?? null,
    });
  }

  return [...byFag.values()].sort((a, b) => compareFag(a.fag, b.fag));
}
