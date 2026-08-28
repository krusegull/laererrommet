"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CALENDAR_CATEGORIES, CALENDAR_CATEGORY_LABELS } from "@/lib/validations";

export interface CalendarEventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  category: (typeof CALENDAR_CATEGORIES)[number];
}

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventModal({
  open,
  onClose,
  defaultDate,
  existing,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
  existing: CalendarEventItem | null;
  onSaved: (event: CalendarEventItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [dateValue, setDateValue] = useState(
    toDatetimeLocal(existing ? new Date(existing.date) : defaultDate)
  );
  const [location, setLocation] = useState(existing?.location ?? "");
  const [category, setCategory] = useState<(typeof CALENDAR_CATEGORIES)[number]>(
    existing?.category ?? "undervisning"
  );
  const [description, setDescription] = useState(existing?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) {
      setError("Tittel er påkrevd.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(existing ? `/api/kalender/${existing.id}` : "/api/kalender", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: new Date(dateValue).toISOString(),
          location: location || undefined,
          category,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å lagre hendelsen.");
        setSaving(false);
        return;
      }
      onSaved(data.event);
      setSaving(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    setDeleting(true);
    try {
      await fetch(`/api/kalender/${existing.id}`, { method: "DELETE" });
      onDeleted(existing.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? "Rediger hendelse" : "Ny hendelse"}>
      <div className="flex flex-col gap-4">
        <Input label="Tittel" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          label="Dato og klokkeslett"
          type="datetime-local"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
        />
        <Input
          label="Sted (valgfritt)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Kategori</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof CALENDAR_CATEGORIES)[number])}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {CALENDAR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CALENDAR_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Beskrivelse (valgfritt)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex items-center justify-between">
          {existing ? (
            <Button variant="ghost" size="sm" onClick={handleDelete} loading={deleting}>
              <Trash2 size={14} /> Slett
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleSave} loading={saving}>
            {existing ? "Lagre" : "Opprett"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
