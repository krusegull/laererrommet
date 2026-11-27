/**
 * KRUTTØNNA – begrepsbomben (første verdenskrig).
 *
 * Elevene blir med på egne PC-er med kode og fornavn. Hvert lag får bomber
 * med fire «ledninger» (spørsmål). Teknikeren (bytter for hver bombe) ser
 * spørsmålet, men ingen svar. Svaralternativene er fordelt på de andre på
 * laget – laget må snakke sammen, og den som har riktig ledning, klipper.
 * Tre feil = bomben går av. Alle desarmerte bomber skyver klassens lunte
 * tilbake (felles mål).
 *
 * Tilstanden ligger i databasen (LiveLag.state) og oppdateres med optimistisk
 * låsing (versjon). Tid håndteres med tidsstempler, så ingen bakgrunnsjobber trengs.
 */
import { prisma } from "@/lib/prisma";
import { KRUTTONNA_BANK } from "./bank";
import type { Prisma } from "@/generated/prisma/client";

export const LEDNINGER_PER_BOMBE = 4;
export const MAKS_FEIL = 3;
export const PAUSE_MS = 7000;
export const SLETT_ETTER_MS = 24 * 60 * 60 * 1000;

export function bombeTid(nivaa: number) {
  return (80 + nivaa * 8) * 1000; // 88–120 sekunder
}

export type BombeSporsmal = { b: number; q: string; valg: string[]; riktig: number; w: string; eier: (string | null)[]; kuttet: number[] };
export type Bombe = {
  nr: number;
  nivaa: number;
  sporsmal: BombeSporsmal[];
  idx: number;
  feil: number;
  start: number;
  frist: number;
  teknikker: string | null;
};
export type Siste = { riktig: boolean; tekst: string; svar: string; w: string; av: string; t: number };
export type Pause = { til: number; type: "desarmert" | "bom" | "slutt"; poeng: number; oppsummering: { q: string; svar: string; w: string }[] };
export type LagState = {
  bomber: number;
  desarmert: number;
  eksplodert: number;
  poeng: number;
  rekke: number;
  brukt: number[];
  bombe: Bombe | null;
  pause: Pause | null;
  siste: Siste | null;
};
export type SpillData = { start?: number; slutt?: number; varighetMin?: number; maal?: number };

export const TOM_LAG: LagState = { bomber: 0, desarmert: 0, eksplodert: 0, poeng: 0, rekke: 0, brukt: [], bombe: null, pause: null, siste: null };

export const LAGNAVN = ["Sarajevo", "Verdun", "Somme", "Marne", "Gallipoli", "Ypres", "Jylland", "Tannenberg", "Isonzo", "Champagne"];
export const LAGFARGER = ["#e8871e", "#2e8bc0", "#3aa35b", "#c0392b", "#8e44ad", "#d4ac0d", "#16a085", "#d35400", "#5d6d7e", "#a93226"];

function stokk<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function lagKode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function lagToken() {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789";
  let t = "";
  for (let i = 0; i < 28; i++) t += abc[Math.floor(Math.random() * abc.length)];
  return t;
}

/** Velger nye spørsmål på riktig nivå (eller nærmeste nivå) som laget ikke har hatt. */
function velgSporsmal(nivaa: number, brukt: number[]): number[] {
  const ledige = KRUTTONNA_BANK.map((s, i) => ({ s, i })).filter((x) => !brukt.includes(x.i));
  const kilde = ledige.length >= LEDNINGER_PER_BOMBE ? ledige : KRUTTONNA_BANK.map((s, i) => ({ s, i }));
  const sortert = stokk(kilde).sort((a, b) => Math.abs(a.s.n - nivaa) - Math.abs(b.s.n - nivaa));
  return sortert.slice(0, LEDNINGER_PER_BOMBE).map((x) => x.i);
}

/** Fordeler ledningene (svaralternativene) på ekspertene. */
function fordel(valgAntall: number, eksperter: string[], teknikker: string | null): (string | null)[] {
  const mottakere = eksperter.length ? stokk(eksperter) : teknikker ? [teknikker] : [];
  return Array.from({ length: valgAntall }, (_, i) => (mottakere.length ? mottakere[i % mottakere.length] : null));
}

export function nyBombe(state: LagState, medlemmer: string[], naa: number): LagState {
  const nivaa = Math.min(5, 1 + state.desarmert);
  const idx = velgSporsmal(nivaa, state.brukt);
  const teknikker = medlemmer.length ? medlemmer[state.bomber % medlemmer.length] : null;
  const eksperter = medlemmer.filter((m) => m !== teknikker);
  const sporsmal: BombeSporsmal[] = idx.map((b) => {
    const s = KRUTTONNA_BANK[b];
    const valg = stokk([s.r, ...s.f]);
    return { b, q: s.q, valg, riktig: valg.indexOf(s.r), w: s.w, eier: fordel(valg.length, eksperter, teknikker), kuttet: [] };
  });
  return {
    ...state,
    bomber: state.bomber + 1,
    brukt: [...state.brukt, ...idx].slice(-90),
    bombe: { nr: state.bomber + 1, nivaa, sporsmal, idx: 0, feil: 0, start: naa, frist: naa + bombeTid(nivaa), teknikker },
    pause: null,
    siste: null,
  };
}

function oppsummer(b: Bombe) {
  return b.sporsmal.map((s) => ({ q: s.q, svar: s.valg[s.riktig], w: s.w }));
}

/** Tidsstyrte overganger: bomben går av når tida er ute, ny bombe etter pausen. */
export function tikk(state: LagState, medlemmer: string[], naa: number, spillSlutt: number | undefined, avsluttet: boolean): LagState {
  let s = state;
  const ferdig = avsluttet || (spillSlutt !== undefined && naa >= spillSlutt);
  if (s.bombe && naa >= s.bombe.frist) {
    s = { ...s, eksplodert: s.eksplodert + 1, rekke: 0, pause: { til: naa + PAUSE_MS, type: "bom", poeng: 0, oppsummering: oppsummer(s.bombe) }, bombe: null };
  }
  if (ferdig) {
    if (s.bombe || (s.pause && s.pause.type !== "slutt" && naa >= s.pause.til) || (!s.bombe && !s.pause)) {
      s = { ...s, bombe: null, pause: { til: Number.MAX_SAFE_INTEGER, type: "slutt", poeng: 0, oppsummering: [] } };
    }
    return s;
  }
  if (!s.bombe && (!s.pause || naa >= s.pause.til)) {
    s = nyBombe(s, medlemmer, naa);
  } else if (s.bombe && medlemmer.length) {
    // Har noen forlatt laget? Gi ledningene og teknikerrollen deres til de som er igjen.
    const b = s.bombe;
    const borte = (id: string | null) => !id || !medlemmer.includes(id);
    const teknikker = borte(b.teknikker) ? medlemmer[0] : b.teknikker;
    const eksperter = medlemmer.filter((m) => m !== teknikker);
    const mottakere = eksperter.length ? eksperter : [teknikker as string];
    if (teknikker !== b.teknikker || b.sporsmal.some((sp) => sp.eier.some(borte))) {
      const sporsmal = b.sporsmal.map((sp) => ({ ...sp, eier: sp.eier.map((e, i) => (borte(e) ? mottakere[i % mottakere.length] : e)) }));
      s = { ...s, bombe: { ...b, teknikker, sporsmal } };
    }
  }
  return s;
}

/** En elev klipper en ledning. Returnerer ny tilstand og om eleven traff riktig. */
export function klipp(state: LagState, spillerId: string, navn: string, sporsmalIdx: number, valg: number, naa: number): { state: LagState; riktig?: boolean; feilmelding?: string } {
  const b = state.bombe;
  if (!b) return { state, feilmelding: "Ingen bombe akkurat nå" };
  if (sporsmalIdx !== b.idx) return { state, feilmelding: "Den ledningen er allerede håndtert" };
  const sp = b.sporsmal[b.idx];
  if (valg < 0 || valg >= sp.valg.length) return { state, feilmelding: "Ugyldig ledning" };
  if (sp.eier[valg] !== spillerId) return { state, feilmelding: "Det er ikke din ledning" };
  if (sp.kuttet.includes(valg)) return { state, feilmelding: "Allerede klippet" };

  if (valg === sp.riktig) {
    const poeng = 50 + b.nivaa * 10;
    const siste: Siste = { riktig: true, tekst: sp.q, svar: sp.valg[sp.riktig], w: sp.w, av: navn, t: naa };
    const nyIdx = b.idx + 1;
    if (nyIdx >= b.sporsmal.length) {
      const sekIgjen = Math.max(0, Math.round((b.frist - naa) / 1000));
      const bonus = 100 + sekIgjen * 2 + (b.feil === 0 ? 50 : 0) + state.rekke * 25;
      return {
        riktig: true,
        state: {
          ...state,
          poeng: state.poeng + poeng + bonus,
          desarmert: state.desarmert + 1,
          rekke: state.rekke + 1,
          bombe: null,
          siste,
          pause: { til: naa + PAUSE_MS, type: "desarmert", poeng: poeng + bonus, oppsummering: oppsummer(b) },
        },
      };
    }
    return { riktig: true, state: { ...state, poeng: state.poeng + poeng, siste, bombe: { ...b, idx: nyIdx } } };
  }

  const feil = b.feil + 1;
  const siste: Siste = { riktig: false, tekst: sp.q, svar: sp.valg[valg], w: "", av: navn, t: naa };
  const nySp = b.sporsmal.map((x, i) => (i === b.idx ? { ...x, kuttet: [...x.kuttet, valg] } : x));
  if (feil >= MAKS_FEIL) {
    return {
      riktig: false,
      state: { ...state, eksplodert: state.eksplodert + 1, rekke: 0, bombe: null, siste, pause: { til: naa + PAUSE_MS, type: "bom", poeng: 0, oppsummering: oppsummer(b) } },
    };
  }
  // Feil klipp koster også 10 sekunder.
  return { riktig: false, state: { ...state, siste, bombe: { ...b, feil, sporsmal: nySp, frist: b.frist - 10000 } } };
}

export function lesState(json: Prisma.JsonValue): LagState {
  const s = (json ?? {}) as Partial<LagState>;
  return { ...TOM_LAG, ...s };
}

/** Henter lagets medlemmer i fast rekkefølge (for rotasjon av teknikker). */
export async function hentMedlemmer(spillId: string, nr: number) {
  return prisma.liveSpiller.findMany({ where: { spillId, lag: nr }, orderBy: { createdAt: "asc" }, select: { id: true, navn: true, riktige: true } });
}

/**
 * Leser og oppdaterer ett lag med optimistisk låsing. `endre` får gjeldende
 * tilstand og returnerer ny (eller samme objekt hvis ingenting skal lagres).
 */
export async function oppdaterLag<T>(
  spillId: string,
  nr: number,
  endre: (s: LagState) => { state: LagState; resultat?: T },
): Promise<{ state: LagState; resultat?: T }> {
  for (let forsok = 0; forsok < 6; forsok++) {
    const lag = await prisma.liveLag.findUnique({ where: { spillId_nr: { spillId, nr } } });
    if (!lag) return { state: { ...TOM_LAG } };
    const gammel = lesState(lag.state);
    const { state, resultat } = endre(gammel);
    if (state === gammel) return { state, resultat };
    const r = await prisma.liveLag.updateMany({
      where: { id: lag.id, versjon: lag.versjon },
      data: { state: state as unknown as Prisma.InputJsonValue, versjon: { increment: 1 } },
    });
    if (r.count === 1) return { state, resultat };
  }
  throw new Error("Klarte ikke å oppdatere laget (for mange samtidige klipp)");
}

export async function tikkLag(spillId: string, nr: number, data: SpillData, avsluttet: boolean) {
  const medlemmer = (await hentMedlemmer(spillId, nr)).map((m) => m.id);
  const naa = Date.now();
  return oppdaterLag(spillId, nr, (s) => {
    const ny = tikk(s, medlemmer, naa, data.slutt, avsluttet);
    return { state: ny };
  });
}

export async function ryddGamleSpill() {
  await prisma.liveSpill.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - SLETT_ETTER_MS) } } });
}

export function lesData(json: Prisma.JsonValue): SpillData {
  return (json ?? {}) as SpillData;
}
