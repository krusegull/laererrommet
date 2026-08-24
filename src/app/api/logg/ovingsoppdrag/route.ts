import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedStudent } from "@/lib/getOwnedStudent";
import { formatLogsForAI } from "@/lib/formatLogsForAI";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";
import { studentIdSchema } from "@/lib/validations";

const SYSTEM_PROMPT = `Du er en erfaren lærer som lager konkrete øvingsoppdrag tilpasset en
elevs utviklingsområder. Du får kun læreren sine egne, anonymiserte notater —
aldri elevens navn. Basert på utviklingsområdene som går igjen, lag ett konkret
øvingsoppdrag: en kort tittel, hva eleven skal gjøre, og hvorfor det hjelper.
Hold det praktisk og gjennomførbart. Norsk bokmål.`;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = studentIdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mangler elev-ID" }, { status: 400 });
  }

  const student = await getOwnedStudent(parsed.data.studentId, session.user.id);
  if (!student) {
    return NextResponse.json({ error: "Fant ikke eleven" }, { status: 404 });
  }

  try {
    const suggestion = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Her er tilbakemeldingene som er registrert:\n\n${formatLogsForAI(student.logs)}\n\nForeslå ett øvingsoppdrag.`,
        },
      ],
      maxTokens: 500,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    const message =
      error instanceof AIUnavailableError ? error.message : "Klarte ikke å generere øvingsoppdrag akkurat nå.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
