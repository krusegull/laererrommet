import type { CALENDAR_CATEGORIES } from "@/lib/validations";

type Category = (typeof CALENDAR_CATEGORIES)[number];

interface CategoryStyle {
  dot: string;
  chip: string;
  border: string;
}

export const CALENDAR_CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  undervisning: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    border: "border-primary",
  },
  vurdering: {
    dot: "bg-amber-500",
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    border: "border-amber-500",
  },
  leksefrist: {
    dot: "bg-sky-500",
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    border: "border-sky-500",
  },
  moter: {
    dot: "bg-secondary",
    chip: "bg-secondary/10 text-secondary",
    border: "border-secondary",
  },
  personlig: {
    dot: "bg-foreground/40",
    chip: "bg-background-subtle text-foreground/70",
    border: "border-foreground/30",
  },
};

export const TERMINLISTE_STYLE: CategoryStyle = {
  dot: "bg-fuchsia-500",
  chip: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
  border: "border-fuchsia-500",
};

/**
 * Fag i kalenderen far en fast farge hver, som nyanser av undervisnings-
 * fargen (primary) — mork/full farge for det forste faget, lysere for hvert
 * fag deretter. Etter 5 fag faller vi tilbake til nyanser av sekundarfargen
 * i stedet for a fortsette a lysne (blir uleselig etter for mange nyanser).
 */
const SUBJECT_DOT_TIERS = ["bg-primary", "bg-primary/78", "bg-primary/58", "bg-primary/42", "bg-primary/30"] as const;
const SUBJECT_DOT_FALLBACK_TIERS = [
  "bg-secondary",
  "bg-secondary/78",
  "bg-secondary/58",
  "bg-secondary/42",
  "bg-secondary/30",
] as const;
const SUBJECT_BORDER_TIERS = [
  "border-primary",
  "border-primary/78",
  "border-primary/58",
  "border-primary/42",
  "border-primary/30",
] as const;
const SUBJECT_BORDER_FALLBACK_TIERS = [
  "border-secondary",
  "border-secondary/78",
  "border-secondary/58",
  "border-secondary/42",
  "border-secondary/30",
] as const;

export const SUBJECT_COLOR_TIER_COUNT = SUBJECT_DOT_TIERS.length;

export function subjectDotClass(colorIndex: number): string {
  const tier = colorIndex % SUBJECT_COLOR_TIER_COUNT;
  const useFallback = Math.floor(colorIndex / SUBJECT_COLOR_TIER_COUNT) % 2 === 1;
  return (useFallback ? SUBJECT_DOT_FALLBACK_TIERS : SUBJECT_DOT_TIERS)[tier];
}

export function subjectBorderClass(colorIndex: number): string {
  const tier = colorIndex % SUBJECT_COLOR_TIER_COUNT;
  const useFallback = Math.floor(colorIndex / SUBJECT_COLOR_TIER_COUNT) % 2 === 1;
  return (useFallback ? SUBJECT_BORDER_FALLBACK_TIERS : SUBJECT_BORDER_TIERS)[tier];
}
