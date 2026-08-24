import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reflectionRequestSchema } from "@/lib/validations";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";

const SPORSMAL_PROMPT = `Du er en klok pedagogisk veileder som hjelper lærere med
periodisk egenrefleksjon. Still 3-4 åpne, konkrete refleksjonsspørsmål for
perioden læreren oppgir, som hjelper dem tenke gjennom egen undervisningspraksis.
Spørsmålene skal være korte, konkrete og ikke-dømmende. Svar kun med
spørsmålene som en punktliste. Norsk bokmål.`;

const OPPSUMMER_PROMPT = `Du er en klok pedagogisk veileder. Læreren har skrevet en fri
refleksjon om en periode av undervisningen sin. Oppsummer refleksjonen kort (2-3
setninger), og foreslå deretter ett konkret fokusområde å ta med videre. Vær
varm og støttende, ikke dømmende. Norsk bokmål.`;

const UTENFRA_PROMPT = `Du er en klok, erfaren mentor som hjelper en lærer se seg selv
utenfra. Du får en samling av lærerens egne private notater — kollegatips de har
notert, tidligere periodiske refleksjoner og egenvurderinger av styrker og
svakheter. Identifiser 2-3 mønstre du ser over tid (tilbakevendende temaer,
utvikling, eller motsetninger mellom hva de sier og hva de gjør), og still 2-3
utviklende spørsmål som hjelper dem reflektere videre. Vær varm, nysgjerrig og
aldri dømmende — dette er lærerens mest private rom. Norsk bokmål.`;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reflectionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const { mode, period, content } = parsed.data;

  try {
    if (mode === "sporsmal") {
      const questions = await askClaude({
        system: SPORSMAL_PROMPT,
        messages: [{ role: "user", content: `Perioden er: ${period || "ikke spesifisert"}` }],
        maxTokens: 400,
      });
      return NextResponse.json({ result: questions });
    }

    if (mode === "oppsummer") {
      if (!content) {
        return NextResponse.json({ error: "Mangler tekst å oppsummere" }, { status: 400 });
      }
      const summary = await askClaude({
        system: OPPSUMMER_PROMPT,
        messages: [
          { role: "user", content: `Periode: ${period || "ikke spesifisert"}\n\nRefleksjon:\n${content}` },
        ],
        maxTokens: 500,
      });
      return NextResponse.json({ result: summary });
    }

    // mode === "utenfra": les ALLE brukerens egne private notater —
    // aldri andre brukeres, kun session.user.id.
    const notes = await prisma.privateNote.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    if (notes.length === 0) {
      return NextResponse.json({
        result: "Du har ingen notater ennå. Legg til noen kollegatips eller refleksjoner først.",
      });
    }

    const notesText = notes
      .map((note) => {
        const date = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
          note.createdAt
        );
        return `[${note.type}, ${date}]\n${note.content}`;
      })
      .join("\n\n");

    const insight = await askClaude({
      system: UTENFRA_PROMPT,
      messages: [{ role: "user", content: notesText }],
      maxTokens: 700,
    });

    return NextResponse.json({ result: insight });
  } catch (error) {
    const message =
      error instanceof AIUnavailableError ? error.message : "Klarte ikke å nå KI-tjenesten akkurat nå.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
