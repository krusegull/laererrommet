import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedElevTekst } from "@/lib/vurdering/getOwnedElevTekst";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";
import type { KriterieVurdering } from "@/lib/vurdering/types";

const SYSTEM_PROMPT =
  "Du hjelper en lærer å vurdere en elevtekst opp mot en vurderingsmal med vektede kriterier. " +
  "Du får elevteksten og kriteriene (id, navn, eventuell beskrivelse, vekting i prosent, og hva som " +
  "regnes som ekstra bra å få med). " +
  "Vurder teksten grundig og saklig, ETT kriterium om gangen, uavhengig av de andre kriteriene. For hvert " +
  "kriterium: gi en poengandel fra 0 til 100 for hvor godt AKKURAT DET kriteriet er oppfylt (ikke vektet - " +
  "det regner systemet ut selv etterpå), en kort kommentar som begrunner poengandelen med konkrete " +
  "eksempler fra teksten der det passer, og om kriteriets «ekstra bra»-indikatorer er oppfylt (hvis " +
  "kriteriet har noen - sett ekstraBraOppfylt til null hvis det ikke har noen). Vær realistisk - ikke " +
  "overdrevent snill eller streng. " +
  "Skriv også en samlet tilbakemelding som ELEVEN selv skal lese og forstå: trekk fram konkret hva som er " +
  "bra, hva som bør forbedres, og gi konkrete, brukbare råd til neste tekst. Skriv i et språk eleven " +
  "forstår - ikke bruk fagspråk fra kriteriene uten å forklare det. " +
  "Svar KUN med gyldig JSON på nøyaktig denne formen, ingen forklaring og ingen markdown-blokk:\n" +
  '{"kriterier":[{"kriteriumId":"...","poengandel":0-100,"kommentar":"...","ekstraBraOppfylt":true|false|null}],"tilbakemelding":"..."}\n' +
  "«kriterier» må ha nøyaktig én oppføring per kriterium du fikk oppgitt, med samme kriteriumId.";

function buildUserMessage(
  tekst: string,
  kriterier: { id: string; name: string; description: string | null; weight: number; ekstraBra: string | null }[]
) {
  return [
    "Elevtekst:",
    tekst,
    "",
    "Kriterier (id, navn, vekting %, eventuell beskrivelse, hva som er ekstra bra):",
    kriterier
      .map(
        (k) =>
          `- ${k.id} | ${k.name} (${k.weight}%)` +
          (k.description ? `: ${k.description}` : "") +
          (k.ekstraBra ? ` | Ekstra bra: ${k.ekstraBra}` : "")
      )
      .join("\n") || "Ingen kriterier satt.",
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

  if (tekst.mal.kriterier.length === 0) {
    return NextResponse.json(
      { error: "Vurderingsmalen har ingen kriterier ennå - legg til minst ett før du ber om et KI-forslag." },
      { status: 400 }
    );
  }

  let raw: string;
  try {
    raw = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(tekst.tekst, tekst.mal.kriterier) }],
      maxTokens: 3072,
      temperature: 0.2,
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

  let parsed: { kriterier?: unknown; tilbakemelding?: unknown };
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return NextResponse.json({ error: "Klarte ikke å tolke KI-forslaget. Prøv igjen." }, { status: 502 });
  }

  const tilbakemelding = typeof parsed.tilbakemelding === "string" ? parsed.tilbakemelding.trim() : "";
  const aiKriterier = Array.isArray(parsed.kriterier) ? parsed.kriterier : [];
  const aiById = new Map(
    aiKriterier
      .filter((k): k is Record<string, unknown> => typeof k === "object" && k !== null)
      .map((k) => [k.kriteriumId, k])
  );

  // Bygger det ferdige regnestykket selv - stoler ikke på at KI-en gjorde
  // vektematten riktig. Mangler et kriterium i KI-svaret, telles det som 0
  // i stedet for å feile hele forespørselen.
  const kriterieVurdering: KriterieVurdering[] = tekst.mal.kriterier.map((k) => {
    const entry = aiById.get(k.id);
    const poengandel =
      entry && typeof entry.poengandel === "number" ? Math.max(0, Math.min(100, Math.round(entry.poengandel))) : 0;
    const kommentar = entry && typeof entry.kommentar === "string" ? entry.kommentar.trim() : "";
    const ekstraBraOppfylt =
      k.ekstraBra && entry && typeof entry.ekstraBraOppfylt === "boolean" ? entry.ekstraBraOppfylt : null;

    return {
      kriteriumId: k.id,
      kriteriumName: k.name,
      weight: k.weight,
      poengandel,
      kommentar,
      ekstraBraOppfylt,
    };
  });

  if (!tilbakemelding || kriterieVurdering.every((k) => !k.kommentar)) {
    return NextResponse.json({ error: "Klarte ikke å tolke KI-forslaget. Prøv igjen." }, { status: 502 });
  }

  const weightedScore = kriterieVurdering.reduce((sum, k) => sum + (k.weight / 100) * k.poengandel, 0);
  const score = Math.max(0, Math.min(100, Math.round(weightedScore)));

  return NextResponse.json({ score, tilbakemelding, kriterieVurdering });
}
