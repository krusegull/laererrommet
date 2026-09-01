"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { TERMINLISTE_GRADES } from "@/lib/validations";
import { TERMINLISTE_STYLE } from "@/lib/calendarColors";
import { cn } from "@/lib/cn";

interface TerminEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  grade: string;
  authorName: string;
  isOwner: boolean;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function TerminlisteClient() {
  const [events, setEvents] = useState<TerminEvent[] | null>(null);
  const [filter, setFilter] = useState<string>("alle");
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [grade, setGrade] = useState<string>(TERMINLISTE_GRADES[0]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kalender/terminliste")
      .then((res) => res.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  const filtered = events?.filter((e) => filter === "alle" || e.grade === filter) ?? [];

  async function handleCreate() {
    if (!title.trim() || !date) {
      setError("Fyll ut tittel og dato.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/kalender/terminliste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: new Date(date).toISOString(),
          grade,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å opprette hendelsen.");
        setSaving(false);
        return;
      }
      setEvents((prev) => [
        ...(prev ?? []),
        { id: data.event.id, title, description: description || null, date: new Date(date).toISOString(), grade, authorName: "Deg", isOwner: true },
      ]);
      setTitle("");
      setDate("");
      setDescription("");
      setModalOpen(false);
      setSaving(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setEvents((prev) => (prev ?? []).filter((e) => e.id !== id));
    await fetch(`/api/kalender/terminliste/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {["alle", ...TERMINLISTE_GRADES].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setFilter(g)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                filter === g
                  ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400"
                  : "border-line text-foreground/60 hover:bg-background-subtle"
              )}
            >
              {g === "alle" ? "Alle trinn" : g}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Ny dato
        </Button>
      </div>

      {events === null ? (
        <div className="flex items-center justify-center gap-2 py-16 text-primary">
          <LoadingDots />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={32} />}
          title="Ingen datoer registrert ennå"
          actionLabel="Ny dato"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((event) => (
            <li key={event.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          TERMINLISTE_STYLE.chip
                        )}
                      >
                        {event.grade}
                      </span>
                      <p className="font-semibold text-foreground">{event.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-foreground/60">{formatDate(event.date)}</p>
                    {event.description && <p className="mt-1 text-sm text-foreground/70">{event.description}</p>}
                    <p className="mt-2 text-xs text-foreground/40">Lagt til av {event.authorName}</p>
                  </div>
                  {event.isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      aria-label="Slett"
                      className="shrink-0 text-foreground/30 hover:text-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ny terminlistedato">
        <div className="flex flex-col gap-4">
          <Input label="Tittel" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Dato" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Trinn</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {TERMINLISTE_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
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
          <Button onClick={handleCreate} loading={saving} className="self-end">
            Opprett
          </Button>
        </div>
      </Modal>
    </div>
  );
}
