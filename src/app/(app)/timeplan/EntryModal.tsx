"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TIMETABLE_DAY_LABELS } from "@/lib/validations";
import type { CalendarSubjectItem } from "../kalender/EventModal";

export interface TimetableEntryItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  notes: string | null;
  subject: CalendarSubjectItem | null;
}

export function EntryModal({
  open,
  onClose,
  defaultDayOfWeek,
  defaultStartTime,
  existing,
  subjects,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  defaultDayOfWeek: number;
  defaultStartTime: string;
  existing: TimetableEntryItem | null;
  subjects: CalendarSubjectItem[];
  onSaved: (entry: TimetableEntryItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(existing?.dayOfWeek ?? defaultDayOfWeek);
  const [startTime, setStartTime] = useState(existing?.startTime ?? defaultStartTime);
  const [endTime, setEndTime] = useState(existing?.endTime ?? "");
  const [subjectId, setSubjectId] = useState(existing?.subject?.id ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) {
      setError("Tittel er påkrevd.");
      return;
    }
    if (!endTime) {
      setError("Sluttid er påkrevd.");
      return;
    }
    if (endTime <= startTime) {
      setError("Sluttid må være etter starttid.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(existing ? `/api/timeplan/${existing.id}` : "/api/timeplan", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dayOfWeek,
          startTime,
          endTime,
          subjectId: subjectId || null,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å lagre oppføringen.");
        setSaving(false);
        return;
      }
      onSaved(data.entry);
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
      await fetch(`/api/timeplan/${existing.id}`, { method: "DELETE" });
      onDeleted(existing.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? "Rediger time" : "Ny time"}>
      <div className="flex flex-col gap-4">
        <Input label="Tittel" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Dag</span>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {TIMETABLE_DAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <Input
            label="Starttid"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input label="Sluttid" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        {subjects.length > 0 && (
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Fag (valgfritt)</span>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              aria-label="Fag"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Ingen fag</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Notater (valgfritt)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
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
