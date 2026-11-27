import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lagToken } from "@/lib/live/kruttonna";

/** POST (offentlig): elev blir med i et spill med kode og fornavn. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { kode?: string; navn?: string };
  const kode = String(body.kode ?? "").replace(/\D/g, "");
  let navn = String(body.navn ?? "").replace(/\s+/g, " ").trim().slice(0, 20);
  if (!/^\d{6}$/.test(kode)) return NextResponse.json({ error: "Koden har seks siffer" }, { status: 400 });
  if (navn.length < 2) return NextResponse.json({ error: "Skriv fornavnet ditt" }, { status: 400 });

  const spill = await prisma.liveSpill.findUnique({ where: { kode }, select: { id: true, status: true, antallLag: true } });
  if (!spill || spill.status === "slutt") return NextResponse.json({ error: "Fant ikke spillet – sjekk koden" }, { status: 404 });

  const andre = await prisma.liveSpiller.findMany({ where: { spillId: spill.id }, select: { navn: true, lag: true } });
  if (andre.length >= 60) return NextResponse.json({ error: "Spillet er fullt" }, { status: 400 });
  const navnene = new Set(andre.map((a) => a.navn.toLowerCase()));
  if (navnene.has(navn.toLowerCase())) {
    let n = 2;
    while (navnene.has(`${navn} ${n}`.toLowerCase())) n++;
    navn = `${navn} ${n}`;
  }

  // Kommer eleven etter at lagene er fordelt, havner hen på laget med færrest.
  let lag: number | null = null;
  const fordelt = andre.some((a) => a.lag !== null);
  if (fordelt) {
    const antall = Array.from({ length: spill.antallLag }, (_, i) => andre.filter((a) => a.lag === i).length);
    lag = antall.indexOf(Math.min(...antall));
  }

  const token = lagToken();
  await prisma.liveSpiller.create({ data: { spillId: spill.id, token, navn, lag } });
  return NextResponse.json({ token, navn });
}
