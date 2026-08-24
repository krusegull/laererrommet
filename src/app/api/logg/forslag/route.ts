import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedStudent } from "@/lib/getOwnedStudent";
import { formatLogsForAI } from "@/lib/formatLogsForAI";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";

const SYSTEM_PROMPT = `Du er en erfaren pedagogisk rådgiver som hjelper lærere å se mønstre i
tilbakemeldinger de har gitt en elev over tid. Du får kun læreren sine egne,
anonymiserte notater — aldri elevens navn eller identifiserbar informasjon.
Se etter gjentakende mønstre i styrker og utviklingsområder, og gi 2-4 korte,
konkrete observasjoner læreren kan bruke i videre oppfølging. Norsk bokmål,
vennlig og profesjonell tone.`;

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
          content: `Her er tilbakemeldingene som er registrert:\n\n${formatLogsForAI(student.logs)}\n\nHvilke mønstre ser du?`,
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
