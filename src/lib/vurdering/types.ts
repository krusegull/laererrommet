export interface SkalaEntry {
  label: string;
  minScore: number;
}

/** En manuell notering av at en elev utmerker seg positivt i en selvvalgt kategori. */
export interface Utmerkelse {
  id: string;
  studentId: string;
  studentName: string;
  kategori: string;
  begrunnelse: string | null;
  dato: string;
  createdAt: string;
}

export interface Kriterium {
  id: string;
  name: string;
  description?: string;
  weight: number;
  ekstraBra?: string;
}

export type KommentarKilde = "laerer" | "ki";

/** En kommentar knyttet til et konkret utsnitt av en elevtekst (som i Word). */
export interface ElevTekstKommentar {
  id: string;
  startOffset: number;
  endOffset: number;
  kommentar: string;
  kilde: KommentarKilde;
  createdAt: string;
}

/** Pr.-kriterium poenggivning fra et KI-forslag - et øyeblikksbilde av kriteriet. */
export interface KriterieVurdering {
  kriteriumId: string;
  kriteriumName: string;
  weight: number;
  /** 0-100: hvor godt kriteriet er oppfylt, uavhengig av vekting. */
  poengandel: number;
  kommentar: string;
  /** Om "ekstra bra"-indikatorene er oppfylt - null hvis kriteriet ikke har noen. */
  ekstraBraOppfylt: boolean | null;
}
