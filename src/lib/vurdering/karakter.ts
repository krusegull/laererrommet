import type { SkalaEntry } from "./types";

/** Finner karakter-labelen i skalaen som poengsummen treffer, eller null. */
export function resolveKarakter(score: number | null | undefined, skala: SkalaEntry[]): string | null {
  if (score == null || skala.length === 0) return null;
  const sorted = [...skala].sort((a, b) => a.minScore - b.minScore);
  let result: string | null = null;
  for (const entry of sorted) {
    if (score >= entry.minScore) result = entry.label;
  }
  return result;
}
