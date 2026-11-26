/**
 * Speiler Læringsportalen (krusegull/forste-verdenskrig,
 * https://raw.githack.com/krusegull/forste-verdenskrig/main/index.html) - se
 * portal-repoets katalog.js og README.md. Nye fag/temaer der (katalog.js) og
 * nye standardsett (verktoy/sett/liste.json) må legges inn her også.
 *
 * Bruker rawcdn.githack.com (githacks "production"-CDN), ikke raw.githack.com
 * (githacks "development"-CDN) - sistnevnte viser en "one more step"-
 * advarselsside for nye/sjeldent besøkte filer, som rawcdn ikke gjør.
 */

export const PORTAL_BASE_URL = "https://rawcdn.githack.com/krusegull/forste-verdenskrig/main/";

/** Ett tema innenfor et fag - matcher ett objekt i katalog.js sin temaer-liste. */
export interface Tema {
  navn: string;
  ikon: string;
  beskrivelse: string;
  /** Relativ sti fra portalens rot, f.eks. "krle/hinduismen/index.html". */
  lenke: string;
}

/** Ett fag i portalen - matcher en fag-blokk i katalog.js. */
export interface Fag {
  id: string;
  navn: string;
  ikon: string;
  farge: string;
  beskrivelse: string;
  temaer: Tema[];
}

export const FAG: Fag[] = [
  {
    id: "samfunnsfag",
    navn: "Samfunnsfag",
    ikon: "🌍",
    farge: "#1d4ed8",
    beskrivelse: "Historie, geografi og samfunnskunnskap",
    temaer: [
      {
        navn: "Første verdenskrig",
        ikon: "🪖",
        beskrivelse: "Kart, krigsarkivet, årsakskjeden, krigsdagbøkene, togreisen og begrepsjakten",
        lenke: "samfunnsfag/forste-verdenskrig/index.html",
      },
      {
        navn: "Den kalde krigen",
        ikon: "🧊",
        beskrivelse: "Reisen i 13 stasjoner og konkurransen JERNTEPPET – forberedelse til prøven",
        lenke: "samfunnsfag/kalde-krigen/index.html",
      },
    ],
  },
  {
    id: "krle",
    navn: "KRLE",
    ikon: "🕉️",
    farge: "#8c2f39",
    beskrivelse: "Kristendom, religion, livssyn og etikk",
    temaer: [
      {
        navn: "Hinduismen",
        ikon: "🪷",
        beskrivelse: "Utforsk hinduismen i 13 stasjoner og øv på de viktigste begrepene",
        lenke: "krle/hinduismen/index.html",
      },
    ],
  },
  {
    id: "norsk",
    navn: "Norsk",
    ikon: "📚",
    farge: "#2e6a8a",
    beskrivelse: "Lesing, skriving, språk og litteratur",
    temaer: [
      {
        navn: "Virkemidler i bildebok – Sinna Mann",
        ikon: "📖",
        beskrivelse: "Kontrast, besjeling, personifikasjon, sammenligning, metafor, motiv og tema",
        lenke: "norsk/sinna-mann/index.html",
      },
      {
        navn: "Dikttolkning – «Aust-Vågøy»",
        ikon: "✍️",
        beskrivelse: "Øving til tentamen: motiv og tema, oppbygging og virkemidler i diktet av Inger Hagerup",
        lenke: "norsk/aust-vagoy/index.html",
      },
    ],
  },
];

export function temaUrl(tema: Tema): string {
  return PORTAL_BASE_URL + tema.lenke;
}

export interface Konkurranse {
  /** Sett-id, matcher verktoy/sett/<id>.json i portal-repoet. */
  id: string;
  tittel: string;
  /** Fagslug slik portalen bruker det (samfunnsfag/krle/norsk). */
  fag: string;
}

export const KONKURRANSE_BASE_URL = PORTAL_BASE_URL + "verktoy/konkurranse.html";

export const KONKURRANSER: Konkurranse[] = [
  { id: "samfunnsfag-forste-verdenskrig", tittel: "SKYTTERGRAVEN – Første verdenskrig", fag: "samfunnsfag" },
  { id: "samfunnsfag-frontlinjen", tittel: "FRONTLINJEN – Første verdenskrig", fag: "samfunnsfag" },
  { id: "samfunnsfag-kalde-krigen", tittel: "JERNTEPPET – Den kalde krigen", fag: "samfunnsfag" },
  { id: "krle-hinduismen", tittel: "YUGA – Hinduismen", fag: "krle" },
  { id: "norsk-sinna-mann", tittel: "SI FRA – Sinna Mann", fag: "norsk" },
  { id: "norsk-aust-vagoy", tittel: "TROSS – Aust-Vågøy", fag: "norsk" },
];

export function konkurranseUrl(k: Konkurranse): string {
  const q = new URLSearchParams({ sett: k.id, fag: k.fag });
  return `${KONKURRANSE_BASE_URL}?${q.toString()}`;
}
