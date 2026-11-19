import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedElevTekst } from "@/lib/vurdering/getOwnedElevTekst";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";

const SYSTEM_PROMPT =
  "Du hjelper en lærer å vurdere en elevtekst opp mot en vurderingsmal med vektede kriterier. " +
  "Du får elevteksten, kriteriene (navn, eventuell beskrivelse, vekting i prosent, og hva som regnes " +
  "som ekstra bra å få med), og karakterskalaen (kun til referanse - du skal IKKE oppgi karakter selv, " +
  "bare en poengsum fra 0 til 100). " +
  "Vurder teksten grundig og saklig opp mot kriteriene, vektet etter oppgitt prosent. Vær realistisk - " +
  "ikke overdrevent snill eller streng. " +
  "Skriv en samlet tilbakemelding som ELEVEN selv skal lese og forstå: trekk fram konkret hva som er bra " +
  "(gjerne med eksempler fra teksten der det passer), hva som bør forbedres, og gi konkrete, brukbare råd " +
  "til neste tekst. Skriv i et språk eleven forstår - ikke bruk fagspråk fra kriteriene uten å forklare det. " +
  "Svar KUN med gyldig JSON på nøyaktig denne formen, ingen forklaring og ingen markdown-blokk:\n" +
  '{"score": 0-100, "tilbakemelding": "..."}';

function buildUserMessage(
  tekst: string,
  kriterier: { name: string; description: string | null; weight: number; ekstraBra: string | null }[],
  skala: unknown
) {
  return [
    "Elevtekst:",
    tekst,
    "",
    "Kriterier (navn, vekting %, eventuell beskrivelse, hva som er ekstra bra):",
    kriterier
      .map(
        (k) =>
          `- ${k.name} (${k.weight}%)` +
          (k.description ? `: ${k.description}` : "") +
          (k.ekstraBra ? ` | Ekstra bra: ${k.ekstraBra}` : "")
      )
      .join("\n") || "Ingen kriterier satt.",
    "",
    "Karakterskala (kun til referanse):",
    JSON.stringify(skala),
  ].join("\n");
}

export async function POST(_request: Request, { params }: { params: Promise<{ tekstId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { tekstId } = await params;
  const tekst = await getOwnedElevTekst(tekstId, session.user.id);
  if (!tekst) {
    return NextResponse.json({ error: "Fant ikke elevteksten" }, { status: 404 });
  }

  let raw: string;
  try {
    raw = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(tekst.tekst, tekst.mal.kriterier, tekst.mal.skala) }],
      maxTokens: 2048,
    });
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("KI-forslag for elevtekst feilet:", error);
    return NextResponse.json({ error: "Klarte ikke å hente KI-forslag akkurat nå. Prøv igjen." }, { status: 502 });
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json({ error: "Klarte ikke å tolke KI-forslaget. Prøv igjen." }, { status: 502 });
  }

  let parsed: { score?: unknown; tilbakemelding?: unknown };
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return NextResponse.json({ error: "Klarte ikke å tolke KI-forslaget. Prøv igjen." }, { status: 502 });
  }

  const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : null;
  const tilbakemelding = typeof parsed.tilbakemelding === "string" ? parsed.tilbakemelding.trim() : "";
  if (score === null || !tilbakemelding) {
    return NextResponse.json({ error: "Klarte ikke å tolke KI-forslaget. Prøv igjen." }, { status: 502 });
  }

  return NextResponse.json({ score, tilbakemelding });
}
