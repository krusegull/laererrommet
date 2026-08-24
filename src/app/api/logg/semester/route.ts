import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedStudent } from "@/lib/getOwnedStudent";
import { formatLogsForAI } from "@/lib/formatLogsForAI";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";

const SYSTEM_PROMPT = `Du er en erfaren kontaktlærer som hjelper til med å utarbeide utkast til
semesteroppsummeringer. Du får kun læreren sine egne, anonymiserte notater —
aldri elevens navn (skriv "eleven"). Skriv et utkast strukturert i tre korte
avsnitt med disse overskriftene, i denne rekkefølgen:

1. Fremgang
2. Fortsatte utviklingsområder
3. Anbefalt fokus neste semester

Vær konkret og bruk et varmt, profesjonelt språk som passer i en tilbakemelding
til foresatte. Presiser ingenting om at dette er KI-generert — teksten skal bare
være selve utkastet. Norsk bokmål.`;

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
    const summary = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Her er tilbakemeldingene som er registrert gjennom semesteret:\n\n${formatLogsForAI(student.logs)}\n\nSkriv semesteroppsummeringen.`,
        },
      ],
      maxTokens: 900,
    });

    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof AIUnavailableError ? error.message : "Klarte ikke å generere oppsummering akkurat nå.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
