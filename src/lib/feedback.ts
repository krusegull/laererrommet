export const CATEGORY_META = {
  STYRKE: {
    label: "Styrke",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    highlight: "bg-emerald-200/70 decoration-emerald-500",
    dot: "bg-emerald-500",
  },
  UTVIKLING: {
    label: "Utvikling",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    highlight: "bg-amber-200/70 decoration-amber-500",
    dot: "bg-amber-500",
  },
  NOYTRAL: {
    label: "Kommentar",
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    highlight: "bg-sky-200/70 decoration-sky-500",
    dot: "bg-sky-500",
  },
} as const;

export type FeedbackCategory = keyof typeof CATEGORY_META;
