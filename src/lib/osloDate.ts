/**
 * Lette hjelpefunksjoner for å regne ut Oslo-lokale datogrenser uten et
 * eget tidssone-bibliotek. Brukes av den daglige kalender-cronjobben.
 * Presisjonen er "god nok" for en påminnelse som uansett leveres på et
 * fast UTC-klokkeslett — den kan avvike med opptil et par timer rundt
 * selve DST-overgangen, men treffer riktig kalenderdag ellers.
 */

function osloOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const match = tz.match(/GMT([+-]\d+)/);
  return match ? parseInt(match[1], 10) * 60 : 60;
}

/** Returnerer [start, end) i UTC for Oslo-kalenderdagen `daysFromNow` dager fra nå. */
export function osloDayBounds(daysFromNow: number): { start: Date; end: Date } {
  const now = new Date();
  const offsetMin = osloOffsetMinutes(now);
  const nowOsloMs = now.getTime() + offsetMin * 60_000;
  const osloMidnightMs = Math.floor(nowOsloMs / 86_400_000) * 86_400_000;
  const startOsloMs = osloMidnightMs + daysFromNow * 86_400_000;
  return {
    start: new Date(startOsloMs - offsetMin * 60_000),
    end: new Date(startOsloMs + 86_400_000 - offsetMin * 60_000),
  };
}

export function isOsloFriday(): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Oslo", weekday: "short" }).format(
    new Date()
  );
  return weekday === "Fri";
}

export function formatOsloTime(date: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
