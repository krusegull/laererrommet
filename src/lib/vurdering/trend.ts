export type Trend = "oppadgaende" | "nedadgaende" | "stabil";

/**
 * Enkel heuristikk for utviklingsretning: sammenligner snittet i siste
 * halvdel av vurderingene mot snittet i første halvdel. Terskelen (8 poeng)
 * er satt for å unngå at små, tilfeldige svingninger slås opp som en trend -
 * dette er en praktisk tommelfingerregel, ikke et statistisk bevist mål på
 * faktisk læring.
 */
export function computeTrend(scores: number[]): Trend | null {
  if (scores.length < 2) return null;
  const mid = Math.ceil(scores.length / 2);
  const firstHalf = scores.slice(0, mid);
  const secondHalf = scores.slice(mid);
  if (secondHalf.length === 0) return null;
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const diff = avg(secondHalf) - avg(firstHalf);
  if (diff >= 8) return "oppadgaende";
  if (diff <= -8) return "nedadgaende";
  return "stabil";
}
