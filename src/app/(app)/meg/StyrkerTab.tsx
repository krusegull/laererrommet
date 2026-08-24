"use client";

import { useState } from "react";
import { Lock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { STRENGTH_CATEGORIES, type StrengthsAssessment } from "@/lib/validations";
import type { PrivateNoteItem } from "./types";

const DEFAULT_RATINGS: StrengthsAssessment = {
  klasseledelse: 3,
  fagligDyktighet: 3,
  relasjonsbygging: 3,
  kreativitet: 3,
  disiplin: 3,
  tilpasningsevne: 3,
};

function parseRatings(content: string): StrengthsAssessment | null {
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    return null;
  }
}

export function StyrkerTab({
  notes,
  onAdd,
}: {
  notes: PrivateNoteItem[];
  onAdd: (note: PrivateNoteItem) => void;
}) {
  const [ratings, setRatings] = useState<StrengthsAssessment>(DEFAULT_RATINGS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/meg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "styrke_svakhet", content: JSON.stringify(ratings) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å lagre vurderingen.");
        setSaving(false);
        return;
      }
      onAdd({
        id: data.note.id,
        type: data.note.type,
        content: data.note.content,
        period: data.note.period,
        source: data.note.source,
        createdAt: data.note.createdAt,
      });
      setSaving(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-button bg-background-subtle p-3 text-sm text-foreground/70">
            <Lock size={16} className="mt-0.5 shrink-0" />
            Denne egenvurderingen er helt privat og kun synlig for deg selv.
          </div>

          {STRENGTH_CATEGORIES.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-foreground/50">{ratings[key]} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={ratings[key]}
                onChange={(e) => setRatings((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>
          ))}

          {error && <p className="text-sm text-error">{error}</p>}

          <Button onClick={handleSave} loading={saving} className="self-end">
            Lagre vurdering
          </Button>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 font-semibold text-foreground">Tidligere vurderinger</h3>
        {notes.length === 0 ? (
          <EmptyState icon={<Gauge size={32} />} title="Ingen vurderinger lagret ennå" />
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((note) => {
              const parsed = parseRatings(note.content);
              if (!parsed) return null;
              return (
                <li key={note.id} className="rounded-card border border-line bg-background p-4 shadow-card">
                  <p className="mb-2 text-xs text-foreground/50">
                    {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
                      new Date(note.createdAt)
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                    {STRENGTH_CATEGORIES.map(({ key, label }) => (
                      <div key={key} className="flex justify-between gap-2">
                        <span className="text-foreground/60">{label}</span>
                        <span className="font-medium text-foreground">{parsed[key]}</span>
                      </div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
