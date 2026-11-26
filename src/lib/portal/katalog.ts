/**
 * Speiler (delvis) Læringsportalen (krusegull/forste-verdenskrig,
 * https://raw.githack.com/krusegull/forste-verdenskrig/main/index.html).
 * Foreløpig bare konkurransene (standardsettene til verktoy/konkurranse.html) -
 * se docs/idebank.md for resten av portalen (fag/temaer/verktøy), som er en
 * egen, større jobb. Nye standardsett i portalens verktoy/sett/liste.json må
 * også legges inn her.
 */

export interface Konkurranse {
  /** Sett-id, matcher verktoy/sett/<id>.json i portal-repoet. */
  id: string;
  tittel: string;
  /** Fagslug slik portalen bruker det (samfunnsfag/krle/norsk). */
  fag: string;
}

export const KONKURRANSE_BASE_URL =
  "https://raw.githack.com/krusegull/forste-verdenskrig/main/verktoy/konkurranse.html";

export const KONKURRANSER: Konkurranse[] = [
  { id: "samfunnsfag-forste-verdenskrig", tittel: "SKYTTERGRAVEN – Første verdenskrig", fag: "samfunnsfag" },
  { id: "samfunnsfag-frontlinjen", tittel: "FRONTLINJEN – Første verdenskrig", fag: "samfunnsfag" },
  { id: "samfunnsfag-kalde-krigen", tittel: "JERNTEPPET – Den kalde krigen", fag: "samfunnsfag" },
  { id: "krle-hinduismen", tittel: "YUGA – Hinduismen", fag: "krle" },
  { id: "norsk-sinna-mann", tittel: "SI FRA – Sinna Mann", fag: "norsk" },
  { id: "norsk-aust-vagoy", tittel: "TROSS – Aust-Vågøy", fag: "norsk" },
];

export function konkurranseUrl(k: Konkurranse): string {
  const q = new URLSearchParams({ sett: k.id, fag: k.fag });
  return `${KONKURRANSE_BASE_URL}?${q.toString()}`;
}
