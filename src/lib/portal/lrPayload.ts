/**
 * Bygger "#lr="-biten konkurranse.html i Læringsportalen leser for å hente
 * klasse/grupper fra Lærerrommet - se LÆRERROMMET-KOBLING i portal-repoets
 * CLAUDE.md. Payload-formen er låst av portalens egen parseLr().
 */

export interface LrElev {
  id: string;
  navn: string;
}

export interface LrLag {
  navn: string;
  elever: LrElev[];
}

export interface LrPayload {
  classId: string;
  klasse: string;
  fag: string;
  tema: string;
  alle: LrElev[];
  lag: LrLag[];
}

export function buildLrPayload(opts: {
  classId: string;
  klasse: string;
  fag: string;
  tema?: string;
  studenter: { id: string; name: string }[];
  grupper?: string[][];
}): LrPayload {
  const nameOf = new Map(opts.studenter.map((s) => [s.id, s.name]));
  const alle = opts.studenter.slice(0, 60).map((s) => ({ id: s.id, navn: s.name }));
  const lag = (opts.grupper ?? [])
    .filter((g) => g.length > 0)
    .slice(0, 8)
    .map((g, i) => ({
      navn: "Lag " + (i + 1),
      elever: g.slice(0, 15).map((id) => ({ id, navn: nameOf.get(id) ?? "?" })),
    }));

  return {
    classId: opts.classId,
    klasse: opts.klasse,
    fag: opts.fag,
    tema: opts.tema ?? "",
    alle,
    lag,
  };
}

export function lrHash(payload: LrPayload): string {
  return "lr=" + encodeURIComponent(JSON.stringify(payload));
}
