import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatMessageSchema } from "@/lib/validations";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";

const SYSTEM_PROMPT = `Du er KI-veilederen i Lærerrommet — en assistent for lærere i
Osloskolen. Du kjenner Oslo kommunes offisielle retningslinjer for
bruk av KI i skolen og svarer konkret og praktisk.

Oslo kommunes retningslinjer:
- Vær alltid kritisk til KI-generert innhold — du er ansvarlig
- Oppgi kilde når du bruker KI-generert innhold
- Gi tydelig veiledning til elevene ved bruk av KI
- Ha et klart mål med KI-bruken
- Del ALDRI personopplysninger om elever eller kolleger
- Del ikke sensitiv informasjon
- KI kan aldri erstatte ditt profesjonelle skjønn

Lærere KAN bruke KI til:
- Undervisningsopplegg, årsplaner og prøver
- Vurderingskriterier og tilbakemeldingsformuleringer
- IOP-tekst uten elevnavn
- Foreldrebrev og informasjonsskriv
- Idémyldring og kreative ideer
- Faglige forklaringer og pedagogiske metoder

Lærere kan IKKE:
- Lime inn elevtekster med navn i kommersielle KI-verktøy
- Dele personopplysninger om elever
- Bruke KI som erstatning for eget faglig skjønn
- Bruke KI til å sette karakterer

Svar alltid: (1) direkte ja eller nei, (2) kort begrunnelse,
(3) praktisk tips. Snakk som en klok kollega. Norsk bokmål.`;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldig melding" },
      { status: 400 }
    );
  }

  const history = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  await prisma.chatMessage.create({
    data: { userId: session.user.id, role: "user", content: parsed.data.content },
  });

  try {
    const reply = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [
        ...history.reverse().map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user", content: parsed.data.content },
      ],
      maxTokens: 700,
    });

    const saved = await prisma.chatMessage.create({
      data: { userId: session.user.id, role: "assistant", content: reply },
    });

    return NextResponse.json({ message: saved });
  } catch (error) {
    const message =
      error instanceof AIUnavailableError
        ? error.message
        : "Klarte ikke å nå KI-veilederen akkurat nå. Prøv igjen om litt.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
