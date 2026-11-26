import { prisma } from "@/lib/prisma";
import { compareFag } from "@/lib/poeng/fag";
import type { FagOversikt, KonkurranseDeltakelse, PoengOversikt, PoengRad } from "@/lib/poeng/types";

/**
 * Elevens poeng delt i tre: faglige poeng per fag (med sum per tema),
 * atferdspoeng (alltid atskilt) og en oversikt over konkurranser eleven har
 * vært med i (plassering, faglige poeng og atferd under konkurransen).
 */
export async function getPoengOversikt(studentId: string, userId: string): Promise<PoengOversikt> {
  const rows = await prisma.elevPoeng.findMany({
    where: { studentId, userId },
    orderBy: [{ dato: "desc" }, { createdAt: "desc" }],
    include: { classProfile: { select: { name: true } } },
  });

  const byFag = new Map<string, FagOversikt>();
  const atferd: PoengOversikt["atferd"] = { sum: 0, pluss: 0, minus: 0, iKonkurranse: 0, rader: [] };
  const konk = new Map<string, KonkurranseDeltakelse>();

  for (const r of rows) {
    const rad: PoengRad = {
      id: r.id,
      fag: r.fag,
      poeng: r.poeng,
      tema: r.tema,
      kilde: r.kilde,
      gruppe: r.gruppe,
      dato: r.dato.toISOString(),
      klasse: r.classProfile?.name ?? null,
      konkurranse: r.konkurranse,
      plassering: r.plassering,
    };

    if (r.kategori === "atferd") {
      atferd.sum += r.poeng;
      if (r.poeng > 0) atferd.pluss += r.poeng;
      else atferd.minus += r.poeng;
      if (r.konkurranse) atferd.iKonkurranse += r.poeng;
      atferd.rader.push(rad);
    } else {
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
      f.rader.push(rad);
    }

    if (r.konkurranse) {
      // Én konkurranse = én import (batch).
      let k = konk.get(r.batchId);
      if (!k) {
        k = {
          konkurranse: r.konkurranse,
          dato: r.dato.toISOString(),
          fag: r.fag,
          tema: r.tema,
          plassering: null,
          gruppe: r.gruppe,
          faglig: 0,
          atferd: 0,
        };
        konk.set(r.batchId, k);
      }
      if (r.plassering != null) k.plassering = r.plassering;
      if (r.kategori === "atferd") k.atferd += r.poeng;
      else k.faglig += r.poeng;
    }
  }

  const deltakelser = [...konk.values()];
  const plasser = deltakelser.map((d) => d.plassering).filter((p): p is number => p != null);

  return {
    fag: [...byFag.values()].sort((a, b) => compareFag(a.fag, b.fag)),
    atferd,
    konkurranser: {
      antall: deltakelser.length,
      seire: plasser.filter((p) => p === 1).length,
      pallplasser: plasser.filter((p) => p <= 3).length,
      snittPlassering: plasser.length ? Math.round((plasser.reduce((a, b) => a + b, 0) / plasser.length) * 10) / 10 : null,
      faglig: deltakelser.reduce((s, d) => s + d.faglig, 0),
      atferd: deltakelser.reduce((s, d) => s + d.atferd, 0),
      deltakelser,
    },
  };
}
