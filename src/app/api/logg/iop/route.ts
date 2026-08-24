import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedStudent } from "@/lib/getOwnedStudent";
import { formatLogsForAI } from "@/lib/formatLogsForAI";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";

const SYSTEM_PROMPT = `Du er en spesialpedagog som hjelper lærere å formulere utkast til punkter
i en individuell opplæringsplan (IOP). Du får kun læreren sine egne, anonymiserte
notater — aldri elevens navn eller identifiserbar informasjon, og du skal ALDRI
bruke navn i svaret ditt (skriv "eleven"). Foreslå ett konkret, målbart IOP-punkt
basert på mønstrene i notatene, med et kort forslag til tiltak. Presiser alltid at
dette er et utkast læreren selv må kvalitetssikre og tilpasse. Norsk bokmål.`;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const studentId = body?.studentId;
  if (typeof studentId !== "string") {
    return NextResponse.json({ error: "Mangler elev-ID" }, { status: 400 });
  }

  const student = await getOwnedStudent(studentId, session.user.id);
  if (!student) {
    return NextResponse.json({ error: "Fant ikke eleven" }, { status: 404 });
  }

  try {
    const suggestion = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Her er tilbakemeldingene som er registrert:\n\n${formatLogsForAI(student.logs)}\n\nForeslå ett IOP-punkt (utkast).`,
        },
      ],
      maxTokens: 500,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    const message =
      error instanceof AIUnavailableError ? error.message : "Klarte ikke å generere forslag akkurat nå.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
