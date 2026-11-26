"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface FagPoengEntry {
  id: string;
  fag: string;
  poeng: number;
  kilde: string | null;
  dato: string;
}

function fagLabel(fag: string): string {
  if (fag === "atferd") return "Atferd";
  return fag.charAt(0).toUpperCase() + fag.slice(1);
}

export function PoengPerFagClient({ initialEntries }: { initialEntries: FagPoengEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);

  async function handleDelete(id: string) {
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/poeng/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Klarte ikke å slette");
    } catch {
      setEntries(previous);
    }
  }

  if (entries.length === 0) return null;

  const byFag = new Map<string, FagPoengEntry[]>();
  for (const e of entries) {
    const list = byFag.get(e.fag) ?? [];
    list.push(e);
    byFag.set(e.fag, list);
  }
  const fagList = Array.from(byFag.entries()).sort((a, b) => a[0].localeCompare(b[0], "nb"));

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-foreground">Poeng per fag</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {fagList.map(([fag, list]) => {
            const sum = list.reduce((s, e) => s + e.poeng, 0);
            return (
              <div key={fag} className="rounded-button border border-line p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{fagLabel(fag)}</p>
                  <p className={cn("text-sm font-semibold", sum < 0 ? "text-error" : "text-primary")}>
                    {sum > 0 ? "+" : ""}
                    {sum} p
                  </p>
                </div>
                <ul className="mt-2 flex flex-col gap-1 text-xs text-foreground/60">
                  {list.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-2">
                      <span>
                        {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(new Date(e.dato))}
                        {e.kilde ? " – " + e.kilde : ""}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={e.poeng < 0 ? "text-error" : ""}>
                          {e.poeng > 0 ? "+" : ""}
                          {e.poeng}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id)}
                          aria-label="Slett poengregistrering"
                          className="text-foreground/30 hover:text-error"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
