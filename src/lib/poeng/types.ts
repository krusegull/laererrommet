export interface PoengRad {
  id: string;
  fag: string;
  poeng: number;
  tema: string;
  kilde: string;
  gruppe: string | null;
  dato: string;
  klasse: string | null;
  konkurranse: string | null;
  plassering: number | null;
}

export interface FagOversikt {
  fag: string;
  sum: number;
  antall: number;
  temaer: { tema: string; sum: number }[];
  rader: PoengRad[];
}

export interface AtferdOversikt {
  sum: number;
  pluss: number;
  minus: number;
  /** Atferdspoeng gitt under konkurranser. */
  iKonkurranse: number;
  rader: PoengRad[];
}

export interface KonkurranseDeltakelse {
  konkurranse: string;
  dato: string;
  fag: string;
  tema: string;
  plassering: number | null;
  gruppe: string | null;
  faglig: number;
  atferd: number;
}

export interface KonkurranseOversikt {
  antall: number;
  seire: number;
  pallplasser: number;
  snittPlassering: number | null;
  faglig: number;
  atferd: number;
  deltakelser: KonkurranseDeltakelse[];
}

export interface PoengOversikt {
  fag: FagOversikt[];
  atferd: AtferdOversikt;
  konkurranser: KonkurranseOversikt;
}
