export interface PriorityStyle {
  dot: string;
  border: string;
  label: string;
}

export const PRIORITY_STYLES: Record<number, PriorityStyle> = {
  1: { dot: "bg-error", border: "border-l-error", label: "Prioritet 1 – haster mest" },
  2: { dot: "bg-pink-500", border: "border-l-pink-500", label: "Prioritet 2 – viktig, haster ikke" },
  3: { dot: "bg-sky-500", border: "border-l-sky-500", label: "Prioritet 3 – minst viktig" },
};

export function detectPriority(content: string): number | null {
  const match = content.match(/^([123])\.\s/);
  return match ? Number(match[1]) : null;
}

export interface SortableNote {
  priority: number | null;
  completed: boolean;
  dismissed: boolean;
}

export function sortNotes<T extends SortableNote>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const ra = (a.dismissed ? null : a.priority) ?? 4;
    const rb = (b.dismissed ? null : b.priority) ?? 4;
    return ra - rb;
  });
}
