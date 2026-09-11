"use client";

import { Plus } from "lucide-react";

export function NoteAddForm({
  value,
  onChange,
  onSubmit,
  placeholder = "Nytt notat, f.eks. 1. Rette prøver...",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-1.5"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-button border border-line bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        aria-label="Legg til notat"
        className="rounded-button bg-primary/10 p-1.5 text-primary hover:bg-primary/20"
      >
        <Plus size={16} />
      </button>
    </form>
  );
}
