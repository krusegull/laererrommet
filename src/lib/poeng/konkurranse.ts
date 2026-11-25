import { FAG } from "@/lib/poeng/fag";

/** Konkurransemalen i Læringsportalen (raw.githack serverer repoet uten «github» i adressen). */
export const KONKURRANSE_URL = "https://raw.githack.com/krusegull/forste-verdenskrig/main/verktoy/konkurranse.html";

/** Fag-id i Læringsportalen (katalog.js) for et fagnavn i Lærerrommet. */
export function portalFagId(fag: string): string {
  return fag
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]/g, "");
}

/** Fagnavn i Lærerrommet for en fag-id fra Læringsportalen, eller null hvis ukjent. */
export function fagFraPortal(id: string): string | null {
  return FAG.find((f) => portalFagId(f) === id.toLowerCase()) ?? null;
}

/** Det konkurransemalen sender tilbake (i #d= i adressen til /poeng/importer). */
export interface KonkurranseResultat {
  v: number;
  tittel?: string;
  fag?: string;
  tema?: string;
  classId?: string;
  dato?: string;
  lag: {
    navn: string;
    poeng: number;
    elever: {
      navn: string;
      id?: string;
      /** Poeng eleven vant selv når skjebnen trakk akkurat henne/ham. */
      egne?: number;
      /** Antall ⭐ ekstrapoeng læreren ga under konkurransen. */
      ekstra?: number;
      /** Sum atferdspoeng (±) gitt under konkurransen. */
      atferd?: number;
    }[];
  }[];
}

/** Plassering per lag ut fra poengsum (likt antall poeng = delt plass: 1, 1, 3 …). */
export function plasseringer(poeng: number[]): number[] {
  return poeng.map((p) => 1 + poeng.filter((q) => q > p).length);
}
