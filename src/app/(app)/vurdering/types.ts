import type { ElevTekstKommentar, Kriterium, KriterieVurdering, SkalaEntry } from "@/lib/vurdering/types";

export interface MalSummary {
  id: string;
  name: string;
  description: string | null;
  kriterieCount: number;
}

export interface MalDetail {
  id: string;
  name: string;
  description: string | null;
  skala: SkalaEntry[];
  kriterier: Kriterium[];
  updatedAt: string;
}

export interface ElevTekstSummary {
  id: string;
  studentId: string;
  studentName: string;
  malId: string;
  malName: string;
  tittel: string;
  score: number | null;
  karakter: string | null;
  dato: string;
  updatedAt: string;
}

export interface ElevTekstDetail extends ElevTekstSummary {
  tekst: string;
  tilbakemelding: string | null;
  kriterieVurdering: KriterieVurdering[] | null;
  kommentarer: ElevTekstKommentar[];
  skala: SkalaEntry[];
}
