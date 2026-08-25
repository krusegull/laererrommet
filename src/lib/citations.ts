const PFDK_PDF_URL =
  "https://www.udir.no/contentassets/25dc2555d1be45bd8ed6d1adb00b094f/24-06-03-pfdk-rammeverk-2.0.pdf";

const CITATION_URLS: Record<string, string> = {
  Oslo: "https://www.oslo.kommune.no/skole-og-utdanning/digitale-verktoy-osloskolen/kunstig-intelligens-ki-i-osloskolen/",
  Osloskolen:
    "https://aktuelt.osloskolen.no/larerik-bruk-av-laringsteknologi/digital-skolehverdag/kunstig-intelligens-ki-i-osloskolen/",
  "Udir-KI": "https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/kunstig-intelligens-i-skolen/",
};

function escapeLinkLabel(label: string) {
  return label.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
}

/**
 * Turns KI-veilederens inline kildehenvisninger ([Oslo], [PfDK, s.7] osv.)
 * into ekte lenker til den nøyaktige kilden, uavhengig av om modellen selv
 * skriver ut riktig URL i "Les mer"-seksjonen.
 */
export function linkifyCitations(content: string): string {
  return content
    .replace(/\[PfDK(?:,\s*s\.\s*(\d+))?\]/g, (_match, page?: string) => {
      const url = page ? `${PFDK_PDF_URL}#page=${page}` : PFDK_PDF_URL;
      const label = escapeLinkLabel(page ? `[PfDK, s.${page}]` : "[PfDK]");
      return `[${label}](${url})`;
    })
    .replace(/\[(Oslo|Osloskolen|Udir-KI)\]/g, (_match, key: string) => {
      const url = CITATION_URLS[key];
      return `[${escapeLinkLabel(`[${key}]`)}](${url})`;
    });
}
