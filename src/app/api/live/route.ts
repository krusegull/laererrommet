import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lagKode, ryddGamleSpill } from "@/lib/live/kruttonna";

/** POST: læreren oppretter et nytt KRUTTØNNA-spill og får en kode. */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { antallLag?: number; varighetMin?: number };
  const antallLag = Math.min(10, Math.max(2, Math.round(Number(body.antallLag) || 8)));
  const varighetMin = Math.min(40, Math.max(5, Math.round(Number(body.varighetMin) || 15)));

  await ryddGamleSpill();

  for (let i = 0; i < 8; i++) {
    const kode = lagKode();
    const finnes = await prisma.liveSpill.findUnique({ where: { kode } });
    if (finnes) continue;
    const spill = await prisma.liveSpill.create({
      data: { userId: session.user.id, kode, tittel: "KRUTTØNNA", antallLag, data: { varighetMin } },
    });
    return NextResponse.json({ id: spill.id, kode });
  }
  return NextResponse.json({ error: "Klarte ikke å lage en ledig kode" }, { status: 500 });
}
