"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PrivateNoteItem } from "./types";

export function KollegatipsTab({
  notes,
  onAdd,
  onRemove,
}: {
  notes: PrivateNoteItem[];
  onAdd: (note: PrivateNoteItem) => void;
  onRemove: (id: string) => void;
}) {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/meg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "kollegatips", content, source: source || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å lagre tipset.");
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
      setContent("");
      setSource("");
      setSaving(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    onRemove(id);
    await fetch(`/api/meg?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Notér et råd</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="F.eks. et konkret tips en kollega ga deg om klasseledelse"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <Input
            label="Kilde (valgfritt)"
            placeholder="F.eks. navn på kollega"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button onClick={handleSubmit} loading={saving} className="self-end">
            Lagre
          </Button>
        </div>
      </Card>

      {notes.length === 0 ? (
        <EmptyState title="Ingen kollegatips lagret ennå" description="Legg til det første rådet over." />
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-card border border-line bg-background p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap text-sm text-foreground">{note.content}</p>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  aria-label="Slett"
                  className="shrink-0 text-foreground/30 hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs text-foreground/50">
                {note.source && <>{note.source} · </>}
                {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
                  new Date(note.createdAt)
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
