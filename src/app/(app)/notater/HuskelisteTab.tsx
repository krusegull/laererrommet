"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TIMETABLE_DAY_LABELS } from "@/lib/validations";
import { startOfWeek, addWeeks, getISOWeekNumber, formatShortDate, isSameWeek } from "./weekUtils";
import { detectPriority, sortNotes } from "./noteUtils";
import { NoteRow, type NoteRowItem } from "./NoteRow";
import { NoteAddForm } from "./NoteAddForm";

interface NoteItem extends NoteRowItem {
  dayOfWeek: number;
}

export function HuskelisteTab() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [items, setItems] = useState<NoteItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet henting ved ukebytte, jf. https://react.dev/reference/react/useEffect#fetching-data-with-effects
    setLoading(true);
    fetch(`/api/notater/huskeliste?weekStart=${weekStart.toISOString()}`)
      .then((res) => res.json())
      .then((data) => {
        const notes: NoteItem[] = (data.notes ?? []).map(
          (n: { id: string; dayOfWeek: number; content: string; priority: number | null; completed: boolean }) => ({
            id: n.id,
            dayOfWeek: n.dayOfWeek,
            content: n.content,
            priority: n.priority,
            completed: n.completed,
            dismissed: n.priority === null && detectPriority(n.content) !== null,
          })
        );
        setItems(notes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [weekStart]);

  const friday = useMemo(() => addDaysToFriday(weekStart), [weekStart]);
  const weekNumber = getISOWeekNumber(weekStart);
  const isCurrentWeek = isSameWeek(weekStart, new Date());

  async function addItem(dayOfWeek: number) {
    const content = (drafts[dayOfWeek] ?? "").trim();
    if (!content) return;
    const priority = detectPriority(content);
    setDrafts((prev) => ({ ...prev, [dayOfWeek]: "" }));
    try {
      const res = await fetch("/api/notater/huskeliste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart: weekStart.toISOString(), dayOfWeek, content, priority }),
      });
      if (!res.ok) return;
      const { note } = await res.json();
      setItems((prev) => [
        ...prev,
        { id: note.id, dayOfWeek: note.dayOfWeek, content: note.content, priority: note.priority, completed: false, dismissed: false },
      ]);
    } catch {
      // Nettverksfeil - teksten forblir tapt fra utkastfeltet, men brukeren kan skrive den pa nytt
    }
  }

  async function patchItem(id: string, patch: { priority?: number | null; completed?: boolean }) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    try {
      await fetch(`/api/notater/huskeliste/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // Nettverksfeil - lokal tilstand kan avvike fra serveren til neste ukebytte/reload
    }
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await fetch(`/api/notater/huskeliste/${id}`, { method: "DELETE" });
    } catch {
      // Nettverksfeil - elementet kan dukke opp igjen ved neste henting
    }
  }

  function dismissPriority(item: NoteItem) {
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, dismissed: true } : it)));
    patchItem(item.id, { priority: null });
  }

  function restorePriority(item: NoteItem) {
    const detected = detectPriority(item.content);
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, dismissed: false, priority: detected } : it)));
    patchItem(item.id, { priority: detected });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            aria-label="Forrige uke"
            className="rounded-button p-1.5 text-foreground/60 hover:bg-background-subtle"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="rounded-button border border-line px-2.5 py-1 text-xs font-medium text-foreground/70 hover:bg-background-subtle"
          >
            Denne uken
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            aria-label="Neste uke"
            className="rounded-button p-1.5 text-foreground/60 hover:bg-background-subtle"
          >
            <ChevronRight size={18} />
          </button>
          <p className="font-semibold text-foreground">
            Uke {weekNumber}, mandag–fredag ({formatShortDate(weekStart)}–{formatShortDate(friday)})
            {isCurrentWeek && <span className="ml-2 text-xs font-normal text-primary">Denne uken</span>}
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-foreground/50">Laster...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {TIMETABLE_DAY_LABELS.map((label, dayOfWeek) => {
              const dayItems = sortNotes(items.filter((it) => it.dayOfWeek === dayOfWeek));
              return (
                <div key={label} className="flex flex-col gap-2 rounded-card border border-line bg-background p-3 shadow-card">
                  <span className="text-sm font-semibold text-foreground">{label}</span>

                  <div className="flex flex-col gap-1.5">
                    {dayItems.map((item) => (
                      <NoteRow
                        key={item.id}
                        item={item}
                        onToggleCompleted={() => patchItem(item.id, { completed: !item.completed })}
                        onDismissPriority={() => dismissPriority(item)}
                        onRestorePriority={() => restorePriority(item)}
                        onDelete={() => deleteItem(item.id)}
                      />
                    ))}
                  </div>

                  <NoteAddForm
                    value={drafts[dayOfWeek] ?? ""}
                    onChange={(value) => setDrafts((prev) => ({ ...prev, [dayOfWeek]: value }))}
                    onSubmit={() => addItem(dayOfWeek)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="flex w-full flex-col gap-2 rounded-card border border-line bg-background-subtle/50 p-3 text-xs text-foreground/70 lg:w-56">
        <p className="font-semibold text-foreground">Prioritet</p>
        <p>
          Skriv <strong>1.</strong>, <strong>2.</strong> eller <strong>3.</strong> først i teksten. Notatet
          sorteres da automatisk: 1 øverst, 2 i midten, 3 nederst.
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-error" /> 1 = haster mest
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-pink-500" /> 2 = viktig, ikke akutt
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" /> 3 = minst viktig
        </p>
        <p>
          Skrev du f.eks. &quot;2. Gjennomgå kapittel 5&quot; uten å mene prioritet? Trykk × ved siden av
          fargemarkøren for å fjerne den.
        </p>
        <p>Huk av boksen til venstre for å markere et notat som gjennomført. Gjennomførte notater flyttes nederst.</p>
      </aside>
    </div>
  );
}

function addDaysToFriday(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 4);
  return d;
}
