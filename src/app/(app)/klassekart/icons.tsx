import type { RoomObject } from "@/lib/klassekart/types";

export const LABELS: Record<RoomObject["type"], string> = {
  dor: "Dør",
  tavle: "Tavle",
  vindu: "Vindu",
  kateter: "Kateter",
  laerer: "Lærer",
  bokhylle: "Bokhylle/skap",
  egen: "Gjenstand",
};

/**
 * Standardmål per gjenstandstype (bredde x høyde i px), basert på typiske
 * virkelige mål i et klasserom:
 * - Tavle: en vanlig klasseromstavle er gjerne rundt 200x100 cm - klart
 *   avlangt og den største, flate gjenstanden i rommet.
 * - Dør: en standard innerdør er ca. 90x210 cm - smalere enn tavla, men
 *   stående/høy.
 * - Vindu: et klasseromsvindu er typisk i størrelsesorden 120-150 cm bredt.
 * - Kateter/lærerpult: en pult/kateter er ca. 120x60 cm - merkbart mindre
 *   enn tavla.
 * - Bokhylle/skap: et skap langs veggen er gjerne grunt og under en meter
 *   bredt.
 * - Lærer: omtrent på størrelse med en person sett ovenfra.
 * - Egen (f.eks. "PC-skap"): typisk et lite skap, på størrelse med lærer.
 * Tallene under er skalert ned for skjermvisning, men beholder disse
 * innbyrdes forholdene.
 */
export const DEFAULT_DIMENSIONS: Record<RoomObject["type"], { w: number; h: number }> = {
  tavle: { w: 100, h: 46 },
  dor: { w: 40, h: 80 },
  vindu: { w: 64, h: 52 },
  kateter: { w: 54, h: 28 },
  bokhylle: { w: 42, h: 20 },
  laerer: { w: 22, h: 22 },
  egen: { w: 26, h: 22 },
};

export const MIN_OBJ_DIM = 10;
export const MAX_OBJ_DIM = 220;

export function objectDimensions(obj: RoomObject): { w: number; h: number } {
  const fallback = DEFAULT_DIMENSIONS[obj.type] ?? { w: 30, h: 30 };
  return { w: obj.w || fallback.w, h: obj.h || fallback.h };
}

export function RoomIcon({ type }: { type: RoomObject["type"] }) {
  switch (type) {
    case "dor":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <rect x="5" y="2" width="14" height="20" rx="1" fill="#c9915a" stroke="#8a5a2b" strokeWidth="1" />
          <circle cx="15.3" cy="12" r="1.1" fill="#4a3018" />
        </svg>
      );
    case "vindu":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <rect x="3" y="3" width="18" height="18" rx="1" fill="#eaf4fb" stroke="#6fa8dc" strokeWidth="1.6" />
          <path d="M12 3v18M3 12h18" stroke="#6fa8dc" strokeWidth="1.6" />
        </svg>
      );
    case "tavle":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <rect x="2" y="3" width="20" height="13" rx="1" fill="#ffffff" stroke="#8c8aa6" strokeWidth="1.4" />
          <path d="M5 7.5h7M5 10.5h5" stroke="#5b8ff9" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="2" y="16" width="20" height="2.2" rx=".5" fill="#c7c5dd" />
        </svg>
      );
    case "kateter":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <rect x="2" y="10" width="20" height="7" rx="1" fill="#c9915a" stroke="#8a5a2b" strokeWidth="1" />
          <rect x="8" y="5.5" width="8" height="5" rx=".6" fill="#444a5e" />
          <rect x="9" y="6.3" width="6" height="3" fill="#7db8e8" />
        </svg>
      );
    case "laerer":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <circle cx="12" cy="7" r="3.2" fill="#f0b386" stroke="#8a5a2b" strokeWidth=".8" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" fill="#5b6fd8" />
        </svg>
      );
    case "bokhylle":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <rect x="2" y="3" width="20" height="18" rx="1" fill="#e4e2f5" stroke="#8c8aa6" strokeWidth="1" />
          <rect x="4" y="5" width="3" height="6.5" fill="#ff6f9c" />
          <rect x="8" y="5" width="2.3" height="6.5" fill="#2fc6a0" />
          <rect x="11" y="5" width="3" height="6.5" fill="#ffb347" />
          <rect x="4" y="13" width="2.3" height="6.5" fill="#4fa6ff" />
          <rect x="7" y="13" width="3" height="6.5" fill="#7b6ef2" />
          <rect x="11" y="13" width="2.3" height="6.5" fill="#ff6f9c" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <path
            d="m12 2 2.9 6.3 6.8.7-5.1 4.6 1.5 6.8L12 17l-6 3.4 1.5-6.8L2.4 9l6.8-.7Z"
            fill="#ffb347"
            stroke="#b8791e"
            strokeWidth=".8"
          />
        </svg>
      );
  }
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="11" width="16" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function ResizeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M21 15v6h-6M21 21 13 13" />
      <path d="M9 3H3v6" />
    </svg>
  );
}
