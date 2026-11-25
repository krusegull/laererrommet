export interface PoengRad {
  id: string;
  fag: string;
  poeng: number;
  tema: string;
  kilde: string;
  gruppe: string | null;
  dato: string;
  klasse: string | null;
}

export interface FagOversikt {
  fag: string;
  sum: number;
  antall: number;
  temaer: { tema: string; sum: number }[];
  rader: PoengRad[];
}
