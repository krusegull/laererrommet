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
