/**
 * Fagene plusspoeng kan gis i. De tre første er fagene læreren selv har
 * klassen i og vises først; resten er klassens andre fag.
 */
export const MINE_FAG = ["Samfunnsfag", "KRLE", "Norsk"] as const;

export const ANDRE_FAG = [
  "Matematikk",
  "Engelsk",
  "Naturfag",
  "Mat og helse",
  "Kroppsøving",
  "Kunst og håndverk",
  "Musikk",
  "Språkfag",
  "Valgfag",
] as const;

export const FAG = [...MINE_FAG, ...ANDRE_FAG] as const;

export type Fag = (typeof FAG)[number];

/** Sorterer fagnavn i samme rekkefølge som FAG (ukjente fag sist, alfabetisk). */
export function compareFag(a: string, b: string): number {
  const ia = (FAG as readonly string[]).indexOf(a);
  const ib = (FAG as readonly string[]).indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b, "nb");
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}
