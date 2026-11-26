/**
 * Læringsportalen (elevenes side, raw.githack.com) speilet i Lærerrommet.
 * Holdes i takt med katalog.js og verktoy/sett/liste.json i repoet
 * krusegull/forste-verdenskrig – legg inn nye temaer og konkurranser her også.
 */
import { KONKURRANSE_URL } from "@/lib/poeng/konkurranse";

export const PORTAL_URL = "https://raw.githack.com/krusegull/forste-verdenskrig/main/";

export interface PortalVerktoy {
  navn: string;
  beskrivelse: string;
  /** Sti i portalen, f.eks. "samfunnsfag/kalde-krigen/reisen.html" */
  sti: string;
  /** Egnet for storskjerm/læreren (presentasjon), ikke elevenes egenarbeid */
  storskjerm?: boolean;
}

export interface PortalKonkurranse {
  /** Sett-id i verktoy/sett/, f.eks. "samfunnsfag-kalde-krigen" */
  id: string;
  navn: string;
  beskrivelse: string;
  antall: number;
}

export interface PortalTema {
  navn: string;
  ikon: string;
  sti: string;
  verktoy: PortalVerktoy[];
  konkurranser: PortalKonkurranse[];
}

export interface PortalFag {
  /** Fag-id i portalen (samme som portalFagId i lib/poeng/konkurranse.ts) */
  id: "samfunnsfag" | "krle" | "norsk";
  /** Fagnavn i Lærerrommet (FAG i lib/poeng/fag.ts) */
  fag: "Samfunnsfag" | "KRLE" | "Norsk";
  ikon: string;
  temaer: PortalTema[];
}

export const PORTAL: PortalFag[] = [
  {
    id: "samfunnsfag",
    fag: "Samfunnsfag",
    ikon: "🌍",
    temaer: [
      {
        navn: "Første verdenskrig",
        ikon: "🪖",
        sti: "samfunnsfag/forste-verdenskrig/index.html",
        verktoy: [
          { navn: "Kartet 1914–1919", beskrivelse: "Interaktivt kart år for år med oppdrag og quiz", sti: "samfunnsfag/forste-verdenskrig/index.html" },
          { navn: "Reisen", beskrivelse: "14 stasjoner med fagtekst, oppgaver og sluttquiz (Arena 9, kap. 5)", sti: "samfunnsfag/forste-verdenskrig/reisen.html" },
          { navn: "Begrepsreisen", beskrivelse: "20 begreper: utforsk, øv og test deg", sti: "samfunnsfag/forste-verdenskrig/begrepsreisen.html" },
          { navn: "Krigsarkivet 1914", beskrivelse: "Escape room", sti: "samfunnsfag/forste-verdenskrig/krigsarkivet.html" },
          { navn: "Årsakskjeden", beskrivelse: "Sett årsakene i riktig rekkefølge", sti: "samfunnsfag/forste-verdenskrig/arsakskjeden.html" },
          { navn: "Begrepsjakten", beskrivelse: "Tidsbasert quiz med 20 begreper", sti: "samfunnsfag/forste-verdenskrig/begrepsjakten.html" },
          { navn: "Krigens gang", beskrivelse: "Krigsdagbøkene", sti: "samfunnsfag/forste-verdenskrig/krigsdagbokene.html" },
          { navn: "Togreisen", beskrivelse: "Reis gjennom krigens Europa", sti: "samfunnsfag/forste-verdenskrig/togreisen.html" },
          { navn: "Presentasjonen", beskrivelse: "Zoompresentasjon etter læringsmålene", sti: "samfunnsfag/forste-verdenskrig/presentasjon.html", storskjerm: true },
        ],
        konkurranser: [
          { id: "samfunnsfag-forste-verdenskrig", navn: "SKYTTERGRAVEN", beskrivelse: "Begrepene til prøven + 10 viktige begreper og land", antall: 61 },
          { id: "samfunnsfag-frontlinjen", navn: "FRONTLINJEN", beskrivelse: "Årsaker, krigføring, Norge, revolusjonen og freden", antall: 50 },
        ],
      },
      {
        navn: "Den kalde krigen",
        ikon: "🧊",
        sti: "samfunnsfag/kalde-krigen/index.html",
        verktoy: [
          { navn: "Reisen", beskrivelse: "13 stasjoner etter forberedelsesheftet, med sluttquiz", sti: "samfunnsfag/kalde-krigen/reisen.html" },
        ],
        konkurranser: [
          { id: "samfunnsfag-kalde-krigen", navn: "JERNTEPPET", beskrivelse: "Én kategori per læringsmål + fagbegreper", antall: 66 },
        ],
      },
    ],
  },
  {
    id: "krle",
    fag: "KRLE",
    ikon: "🕉️",
    temaer: [
      {
        navn: "Hinduismen",
        ikon: "🪷",
        sti: "krle/hinduismen/index.html",
        verktoy: [
          { navn: "Reisen", beskrivelse: "13 stasjoner med fagtekst, oppgaver og quiz", sti: "krle/hinduismen/reisen.html" },
          { navn: "Begrepsreisen", beskrivelse: "39 begreper i 6 verdener: utforsk, øv og test deg", sti: "krle/hinduismen/begrepsreisen.html" },
        ],
        konkurranser: [
          { id: "krle-hinduismen", navn: "YUGA", beskrivelse: "Begrepskampen om hinduismen", antall: 55 },
        ],
      },
    ],
  },
  {
    id: "norsk",
    fag: "Norsk",
    ikon: "📚",
    temaer: [
      {
        navn: "Virkemidler i bildebok – Sinna Mann",
        ikon: "📖",
        sti: "norsk/sinna-mann/index.html",
        verktoy: [],
        konkurranser: [
          { id: "norsk-sinna-mann", navn: "SI FRA", beskrivelse: "Kontrast, besjeling, metafor, motiv og tema (uten bilder – vis oppslagene fra boka)", antall: 62 },
        ],
      },
      {
        navn: "Dikttolkning – «Aust-Vågøy»",
        ikon: "✍️",
        sti: "norsk/aust-vagoy/index.html",
        verktoy: [],
        konkurranser: [
          { id: "norsk-aust-vagoy", navn: "TROSS", beskrivelse: "Øving til tentamen etter skriverammen", antall: 61 },
        ],
      },
    ],
  },
];

export const portalUrl = (sti: string) => PORTAL_URL + sti;

/** Alle ferdige konkurranser i et fag (fagnavn i Lærerrommet). */
export function konkurranserFor(fag: string): (PortalKonkurranse & { tema: string })[] {
  return PORTAL.filter((f) => f.fag === fag).flatMap((f) =>
    f.temaer.flatMap((t) => t.konkurranser.map((k) => ({ ...k, tema: t.navn.replace(/^.*– /, "").replace(/[«»]/g, "") })))
  );
}

/**
 * Adresse som åpner en konkurranse. Lag/elever sendes i #-delen (lr), som
 * aldri går til noen server.
 */
export function konkurranseUrl(settId: string, fagId: string, lr?: unknown): string {
  const base = `${KONKURRANSE_URL}?sett=${encodeURIComponent(settId)}&fag=${encodeURIComponent(fagId)}`;
  return lr ? `${base}#lr=${encodeURIComponent(JSON.stringify(lr))}` : base;
}
