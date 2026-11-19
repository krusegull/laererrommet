export interface SkalaEntry {
  label: string;
  minScore: number;
}

export interface Kriterium {
  id: string;
  name: string;
  description?: string;
  weight: number;
  ekstraBra?: string;
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
