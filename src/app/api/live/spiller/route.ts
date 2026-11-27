import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hentMedlemmer, klipp, lesData, oppdaterLag, tikkLag, LAGNAVN, LAGFARGER, type LagState } from "@/lib/live/kruttonna";

export const dynamic = "force-dynamic";

async function finnSpiller(token: string | null) {
  if (!token || token.length < 20) return null;
  return prisma.liveSpiller.findUnique({
    where: { token },
    include: { spill: { select: { id: true, tittel: true, status: true, antallLag: true, data: true } } },
  });
}

/** Bygger det eleven skal se: teknikeren ser spørsmålet, ekspertene ser bare sine ledninger. */
function visning(state: LagState, megId: string, medlemmer: { id: string; navn: string }[]) {
  const navn = (id: string | null) => medlemmer.find((m) => m.id === id)?.navn ?? "";
  const b = state.bombe;
  let bombe = null;
  if (b) {
    const sp = b.sporsmal[b.idx];
    const solo = medlemmer.length <= 1;
    const erTeknikker = b.teknikker === megId;
    bombe = {
      nr: b.nr,
      nivaa: b.nivaa,
      idx: b.idx,
      antall: b.sporsmal.length,
      feil: b.feil,
      frist: b.frist,
      start: b.start,
      teknikker: navn(b.teknikker),
      erTeknikker,
      sporsmal: erTeknikker || solo ? sp.q : null,
      mine: sp.valg.map((tekst, i) => ({ i, tekst, kuttet: sp.kuttet.includes(i) })).filter((v) => sp.eier[v.i] === megId),
      fordeling: medlemmer
        .filter((m) => m.id !== b.teknikker || solo)
        .map((m) => ({ navn: m.navn, antall: sp.eier.filter((e, i) => e === m.id && !sp.kuttet.includes(i)).length })),
    };
  }
  return {
    bombe,
    pause: state.pause,
    siste: state.siste,
    poeng: state.poeng,
    desarmert: state.desarmert,
    eksplodert: state.eksplodert,
    rekke: state.rekke,
  };
}

export async function GET(request: NextRequest) {
  const spiller = await finnSpiller(request.nextUrl.searchParams.get("token"));
  if (!spiller) return NextResponse.json({ error: "Ukjent spiller" }, { status: 404 });
  const { spill } = spiller;
  const data = lesData(spill.data);
  prisma.liveSpiller.update({ where: { id: spiller.id }, data: { sistSett: new Date() } }).catch(() => {});

  const grunn = { status: spill.status, tittel: spill.tittel, navn: spiller.navn, lag: spiller.lag, slutt: data.slutt ?? null, naa: Date.now() };
  if (spiller.lag === null) return NextResponse.json({ ...grunn, lagnavn: null, farge: null, medlemmer: [] });

  const medlemmer = await hentMedlemmer(spill.id, spiller.lag);
  const lagInfo = { lagnavn: LAGNAVN[spiller.lag] ?? `Lag ${spiller.lag + 1}`, farge: LAGFARGER[spiller.lag] ?? "#888", medlemmer: medlemmer.map((m) => m.navn) };
  if (spill.status === "lobby") return NextResponse.json({ ...grunn, ...lagInfo });

  const { state } = await tikkLag(spill.id, spiller.lag, data, spill.status === "slutt");
  return NextResponse.json({ ...grunn, ...lagInfo, spill: visning(state, spiller.id, medlemmer) });
}

/** POST: eleven klipper en ledning. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { token?: string; sporsmal?: number; valg?: number };
  const spiller = await finnSpiller(body.token ?? null);
  if (!spiller || spiller.lag === null) return NextResponse.json({ error: "Ukjent spiller" }, { status: 404 });
  if (spiller.spill.status !== "spill") return NextResponse.json({ error: "Spillet er ikke i gang" }, { status: 400 });
  const lagNr = spiller.lag;
  const naa = Date.now();
  const { resultat } = await oppdaterLag<{ riktig?: boolean; feilmelding?: string }>(spiller.spill.id, lagNr, (s) => {
    if (s.bombe && naa >= s.bombe.frist) return { state: s, resultat: { feilmelding: "For sent!" } };
    const r = klipp(s, spiller.id, spiller.navn, Number(body.sporsmal), Number(body.valg), naa);
    return { state: r.state, resultat: { riktig: r.riktig, feilmelding: r.feilmelding } };
  });
  if (resultat?.riktig) await prisma.liveSpiller.update({ where: { id: spiller.id }, data: { riktige: { increment: 1 } } });
  return NextResponse.json(resultat ?? {});
}
