import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedElevTekst } from "@/lib/vurdering/getOwnedElevTekst";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";
import type { KriterieVurdering } from "@/lib/vurdering/types";

const MAX_CALIBRATION_EXAMPLES = 3;
const CALIBRATION_EXCERPT_LENGTH = 500;
const MAX_INLINE_KOMMENTARER = 6;

const SYSTEM_PROMPT =
  "Du hjelper en lærer å vurdere en elevtekst opp mot en vurderingsmal med vektede kriterier. " +
  "Du får elevteksten, kriteriene (id, navn, eventuell beskrivelse, vekting i prosent, og hva som " +
  "regnes som ekstra bra å få med), og eventuelt noen kalibreringseksempler - tekster denne læreren " +
  "allerede har vurdert ferdig for samme mal, med lærerens faktiske poengsum og tilbakemelding. Bruk " +
  "kalibreringseksemplene til å treffe denne lærerens standard (hvor streng/snill, hva slags " +
  "tilbakemelding læreren gir) - men vurder likevel den NYE teksten på sine egne meritter, ikke bare " +
  "relativt til eksemplene. " +
  "Vurder teksten grundig og saklig, ETT kriterium om gangen, uavhengig av de andre kriteriene. For hvert " +
  "kriterium: gi en poengandel fra 0 til 100 for hvor godt AKKURAT DET kriteriet er oppfylt (ikke vektet - " +
  "det regner systemet ut selv etterpå), en kort kommentar som begrunner poengandelen med konkrete " +
  "eksempler fra teksten der det passer, og om kriteriets «ekstra bra»-indikatorer er oppfylt (hvis " +
  "kriteriet har noen - sett ekstraBraOppfylt til null hvis det ikke har noen). Vær realistisk - ikke " +
  "overdrevent snill eller streng. " +
  "Skriv også en samlet tilbakemelding som ELEVEN selv skal lese og forstå: trekk fram konkret hva som er " +
  "bra, hva som bør forbedres, og gi konkrete, brukbare råd til neste tekst. Skriv i et språk eleven " +
  "forstår - ikke bruk fagspråk fra kriteriene uten å forklare det. " +
  `I tillegg: foreslå inntil ${MAX_INLINE_KOMMENTARER} korte kommentarer knyttet til helt spesifikke ` +
  "steder i teksten (som kommentarer i Word) - f.eks. en setning med godt billedspråk, en gjentatt " +
  "skrivefeil, eller en svak overgang. For hver: «utdrag» må være et EKSAKT, ORDRETT sitat - kopiert " +
  "tegn for tegn med riktig tegnsetting og store/små bokstaver - rett fra elevteksten over, ikke " +
  "omskrevet eller forkortet med «...». Hold hvert utdrag kort (under 15 ord) og unikt nok til at det " +
  "bare finnes ett sted i teksten. Et utdrag som ikke finnes ordrett i teksten blir forkastet. " +
  "Svar KUN med gyldig JSON på nøyaktig denne formen, ingen forklaring og ingen markdown-blokk:\n" +
  '{"kriterier":[{"kriteriumId":"...","poengandel":0-100,"kommentar":"...","ekstraBraOppfylt":true|false|null}],' +
  '"tilbakemelding":"...","inlineKommentarer":[{"utdrag":"...","kommentar":"..."}]}\n' +
  "«kriterier» må ha nøyaktig én oppføring per kriterium du fikk oppgitt, med samme kriteriumId.";

interface CalibrationExample {
  tekst: string;
  score: number | null;
  karakter: string | null;
  tilbakemelding: string | null;
}

/**
 * Plukker opptil `max` jevnt fordelte eksempler fra en liste sortert på
 * poengsum - gir et spenn fra svakeste til sterkeste i stedet for bare de
 * nyeste, som gir KI-en et bedre bilde av lærerens standard på tvers av
 * nivå.
 */
function pickSpreadExamples<T>(sorted: T[], max: number): T[] {
  if (sorted.length <= max) return sorted;
  const indices = new Set<number>();
  for (let i = 0; i < max; i++) {
    indices.add(Math.round((i / (max - 1)) * (sorted.length - 1)));
  }
  return [...indices].sort((a, b) => a - b).map((i) => sorted[i]);
}

function buildUserMessage(
  tekst: string,
  kriterier: { id: string; name: string; description: string | null; weight: number; ekstraBra: string | null }[],
  calibrationExamples: CalibrationExample[]
) {
  const parts = [
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
  ];

  if (calibrationExamples.length > 0) {
    parts.push(
      "",
      "Kalibreringseksempler (lærerens faktiske vurderinger av andre tekster for samme mal):",
      calibrationExamples
        .map((e, i) => {
          const excerpt =
            e.tekst.length > CALIBRATION_EXCERPT_LENGTH
              ? e.tekst.slice(0, CALIBRATION_EXCERPT_LENGTH) + "…"
              : e.tekst;
          return (
            `Eksempel ${i + 1} - lærerens poengsum: ${e.score}/100${e.karakter ? " (karakter " + e.karakter + ")" : ""}\n` +
            `Tekst (utdrag): ${excerpt}\n` +
            (e.tilbakemelding ? `Lærerens tilbakemelding: ${e.tilbakemelding}` : "")
          );
        })
        .join("\n\n")
    );
  }

  return parts.join("\n");
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

  const gradedForMal = await prisma.elevTekst.findMany({
    where: { malId: tekst.malId, userId: session.user.id, id: { not: tekst.id }, score: { not: null } },
    select: { tekst: true, score: true, karakter: true, tilbakemelding: true },
    orderBy: { score: "asc" },
  });
  const calibrationExamples = pickSpreadExamples(gradedForMal, MAX_CALIBRATION_EXAMPLES);

  let raw: string;
  try {
    raw = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(tekst.tekst, tekst.mal.kriterier, calibrationExamples) }],
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

  let parsed: { kriterier?: unknown; tilbakemelding?: unknown; inlineKommentarer?: unknown };
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

  // Løser inline-kommentarene opp mot faktiske tegnposisjoner selv - stoler
  // ikke på at KI-en oppgir presise offset-tall (det gjør de upålitelig).
  // Et utdrag som ikke finnes ordrett i teksten, eller som overlapper en
  // annen kommentar, blir bare forkastet i stedet for å feile forespørselen.
  const aiInline = Array.isArray(parsed.inlineKommentarer) ? parsed.inlineKommentarer : [];
  const takenRanges: { start: number; end: number }[] = tekst.kommentarer.map((k) => ({
    start: k.startOffset,
    end: k.endOffset,
  }));
  const resolvedInline: { startOffset: number; endOffset: number; kommentar: string }[] = [];

  for (const entry of aiInline) {
    if (resolvedInline.length >= MAX_INLINE_KOMMENTARER) break;
    if (typeof entry !== "object" || entry === null) continue;
    const utdrag = "utdrag" in entry && typeof entry.utdrag === "string" ? entry.utdrag : null;
    const kommentarTekst = "kommentar" in entry && typeof entry.kommentar === "string" ? entry.kommentar.trim() : "";
    if (!utdrag || !kommentarTekst) continue;

    const start = tekst.tekst.indexOf(utdrag);
    if (start === -1) continue;
    const end = start + utdrag.length;
    const overlaps = takenRanges.some((r) => start < r.end && end > r.start);
    if (overlaps) continue;

    takenRanges.push({ start, end });
    resolvedInline.push({ startOffset: start, endOffset: end, kommentar: kommentarTekst });
  }

  const createdKommentarer =
    resolvedInline.length > 0
      ? await prisma.$transaction(
          resolvedInline.map((k) =>
            prisma.elevTekstKommentar.create({
              data: { elevTekstId: tekst.id, startOffset: k.startOffset, endOffset: k.endOffset, kommentar: k.kommentar, kilde: "ki" },
            })
          )
        )
      : [];

  return NextResponse.json({
    score,
    tilbakemelding,
    kriterieVurdering,
    calibratedWithCount: calibrationExamples.length,
    kommentarer: createdKommentarer.map((k) => ({
      id: k.id,
      startOffset: k.startOffset,
      endOffset: k.endOffset,
      kommentar: k.kommentar,
      kilde: k.kilde,
      createdAt: k.createdAt.toISOString(),
    })),
  });
}
