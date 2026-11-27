import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lesData, lesState, tikkLag, robotTrekk, lagToken, erRobot, ROBOT_PREFIKS, LAGNAVN, LAGFARGER, TOM_LAG, type SpillData } from "@/lib/live/kruttonna";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

async function eget(id: string, userId: string) {
  return prisma.liveSpill.findFirst({ where: { id, userId } });
}

/** GET: hele spillet for storskjermen (bare læreren som eier spillet). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  const { id } = await params;
  const spill = await eget(id, session.user.id);
  if (!spill) return NextResponse.json({ error: "Fant ikke spillet" }, { status: 404 });
  const data = lesData(spill.data);

  let status = spill.status;
  if (status === "spill" && data.slutt && Date.now() >= data.slutt) {
    await prisma.liveSpill.update({ where: { id }, data: { status: "slutt" } });
    status = "slutt";
  }

  const spillere = await prisma.liveSpiller.findMany({ where: { spillId: id }, orderBy: { createdAt: "asc" }, select: { id: true, navn: true, lag: true, riktige: true, sistSett: true, token: true } });
  const lagRader = await prisma.liveLag.findMany({ where: { spillId: id }, orderBy: { nr: "asc" } });

  const lag = [];
  for (let nr = 0; nr < spill.antallLag; nr++) {
    let state = lagRader.find((l) => l.nr === nr) ? lesState(lagRader.find((l) => l.nr === nr)!.state) : { ...TOM_LAG };
    if (status !== "lobby" && lagRader.some((l) => l.nr === nr)) {
      if (status === "spill") await robotTrekk(id, nr);
      state = (await tikkLag(id, nr, data, status === "slutt")).state;
    }
    const b = state.bombe;
    lag.push({
      nr,
      navn: LAGNAVN[nr] ?? `Lag ${nr + 1}`,
      farge: LAGFARGER[nr] ?? "#888",
      medlemmer: spillere.filter((s) => s.lag === nr).map((s) => ({ id: s.id, navn: s.navn, riktige: s.riktige })),
      poeng: state.poeng,
      desarmert: state.desarmert,
      eksplodert: state.eksplodert,
      rekke: state.rekke,
      bombe: b ? { nivaa: b.nivaa, idx: b.idx, antall: b.sporsmal.length, feil: b.feil, frist: b.frist, start: b.start } : null,
      pause: state.pause ? { type: state.pause.type, til: state.pause.til } : null,
    });
  }

  return NextResponse.json({
    id,
    kode: spill.kode,
    tittel: spill.tittel,
    status,
    antallLag: spill.antallLag,
    data,
    naa: Date.now(),
    spillere: spillere.map((s) => ({ id: s.id, navn: s.navn, lag: s.lag, robot: erRobot(s.token), aktiv: erRobot(s.token) || Date.now() - s.sistSett.getTime() < 15000 })),
    lag,
  });
}

/** POST: lærerens handlinger – fordel, flytt, kast, antallLag, start, stopp. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  const { id } = await params;
  const spill = await eget(id, session.user.id);
  if (!spill) return NextResponse.json({ error: "Fant ikke spillet" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { handling?: string; antallLag?: number; spillerId?: string; lag?: number; varighetMin?: number };
  const data = lesData(spill.data);

  switch (body.handling) {
    case "antallLag": {
      const n = Math.min(10, Math.max(2, Math.round(Number(body.antallLag) || 8)));
      await prisma.liveSpill.update({ where: { id }, data: { antallLag: n } });
      await prisma.liveSpiller.updateMany({ where: { spillId: id, lag: { gte: n } }, data: { lag: null } });
      break;
    }
    case "varighet": {
      const v = Math.min(40, Math.max(5, Math.round(Number(body.varighetMin) || 15)));
      await prisma.liveSpill.update({ where: { id }, data: { data: { ...data, varighetMin: v } as Prisma.InputJsonValue } });
      break;
    }
    case "fordel": {
      const spillere = await prisma.liveSpiller.findMany({ where: { spillId: id }, select: { id: true } });
      const stokket = spillere.map((s) => s.id).sort(() => Math.random() - 0.5);
      await prisma.$transaction(stokket.map((sid, i) => prisma.liveSpiller.update({ where: { id: sid }, data: { lag: i % spill.antallLag } })));
      break;
    }
    case "flytt": {
      if (!body.spillerId) break;
      const lag = body.lag === null || body.lag === undefined || Number(body.lag) < 0 ? null : Math.min(spill.antallLag - 1, Math.round(Number(body.lag)));
      await prisma.liveSpiller.updateMany({ where: { id: body.spillerId, spillId: id }, data: { lag } });
      if (lag !== null && spill.status === "spill") await sikreLag(id, lag);
      break;
    }
    case "kast": {
      if (body.spillerId) await prisma.liveSpiller.deleteMany({ where: { id: body.spillerId, spillId: id } });
      break;
    }
    case "start": {
      const uten = await prisma.liveSpiller.count({ where: { spillId: id, lag: null } });
      if (uten > 0) return NextResponse.json({ error: "Fordel alle elevene på lag først" }, { status: 400 });
      const naa = Date.now();
      const varighetMin = data.varighetMin ?? 15;
      const ny: SpillData = { ...data, start: naa, slutt: naa + varighetMin * 60000, maal: spill.antallLag * 4 };
      await prisma.liveLag.deleteMany({ where: { spillId: id } });
      await prisma.liveLag.createMany({ data: Array.from({ length: spill.antallLag }, (_, nr) => ({ spillId: id, nr, state: { ...TOM_LAG } as unknown as Prisma.InputJsonValue })) });
      await prisma.liveSpiller.updateMany({ where: { spillId: id }, data: { riktige: 0 } });
      await prisma.liveSpill.update({ where: { id }, data: { status: "spill", data: ny as Prisma.InputJsonValue } });
      break;
    }
    case "stopp": {
      await prisma.liveSpill.update({ where: { id }, data: { status: "slutt", data: { ...data, slutt: Math.min(data.slutt ?? Date.now(), Date.now()) } as Prisma.InputJsonValue } });
      break;
    }
    case "roboter": {
      // Testelever som spiller selv – for å prøve spillet uten flere PC-er.
      const antall = Math.min(40, Math.max(1, Math.round(Number(body.antallLag) || 8)));
      const andre = await prisma.liveSpiller.findMany({ where: { spillId: id }, select: { navn: true, lag: true } });
      const fordelt = andre.some((a) => a.lag !== null) || spill.status !== "lobby";
      const telling = Array.from({ length: spill.antallLag }, (_, i) => andre.filter((a) => a.lag === i).length);
      const forste = andre.filter((a) => a.navn.startsWith("🤖")).length;
      const rader = Array.from({ length: antall }, (_, i) => {
        let lag: number | null = null;
        if (fordelt) {
          lag = telling.indexOf(Math.min(...telling));
          telling[lag]++;
        }
        return { spillId: id, token: ROBOT_PREFIKS + lagToken(), navn: `🤖 Robot ${forste + i + 1}`, lag };
      });
      await prisma.liveSpiller.createMany({ data: rader });
      if (spill.status === "spill") for (const r of rader) if (r.lag !== null) await sikreLag(id, r.lag);
      break;
    }
    case "slett": {
      await prisma.liveSpill.delete({ where: { id } });
      break;
    }
    default:
      return NextResponse.json({ error: "Ukjent handling" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

async function sikreLag(spillId: string, nr: number) {
  await prisma.liveLag.upsert({ where: { spillId_nr: { spillId, nr } }, create: { spillId, nr, state: { ...TOM_LAG } as unknown as Prisma.InputJsonValue }, update: {} });
}
