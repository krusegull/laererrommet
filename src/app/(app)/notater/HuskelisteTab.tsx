"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { TIMETABLE_DAY_LABELS } from "@/lib/validations";
import { startOfWeek, addWeeks, getISOWeekNumber, formatShortDate, isSameWeek } from "./weekUtils";
import { cn } from "@/lib/cn";

interface DayNote {
  content: string;
  priority: number | null;
  dismissed: boolean;
  saved: boolean;
}

const PRIORITY_STYLES: Record<number, { dot: string; label: string }> = {
  1: { dot: "bg-error", label: "Prioritet 1 – haster mest" },
  2: { dot: "bg-amber-500", label: "Prioritet 2 – viktig, haster ikke" },
  3: { dot: "bg-sky-500", label: "Prioritet 3 – minst viktig" },
};

function detectPriority(content: string): number | null {
  const match = content.match(/^([123])\.\s/);
  return match ? Number(match[1]) : null;
}

function emptyDayNotes(): Record<number, DayNote> {
  return Object.fromEntries(
    TIMETABLE_DAY_LABELS.map((_, i) => [i, { content: "", priority: null, dismissed: false, saved: true }])
  );
}

export function HuskelisteTab() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [days, setDays] = useState<Record<number, DayNote>>(emptyDayNotes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet henting ved ukebytte, jf. https://react.dev/reference/react/useEffect#fetching-data-with-effects
    setLoading(true);
    fetch(`/api/notater/huskeliste?weekStart=${weekStart.toISOString()}`)
      .then((res) => res.json())
      .then((data) => {
        const next = emptyDayNotes();
        for (const note of data.notes ?? []) {
          next[note.dayOfWeek] = {
            content: note.content,
            priority: note.priority,
            dismissed: note.priority === null && detectPriority(note.content) !== null,
            saved: true,
          };
        }
        setDays(next);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [weekStart]);

  const friday = useMemo(() => addDaysToFriday(weekStart), [weekStart]);
  const weekNumber = getISOWeekNumber(weekStart);
  const isCurrentWeek = isSameWeek(weekStart, new Date());

  function updateContent(dayOfWeek: number, content: string) {
    setDays((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        content,
        dismissed: detectPriority(content) === null ? false : prev[dayOfWeek].dismissed,
        saved: false,
      },
    }));
  }

  async function persistDay(dayOfWeek: number, content: string, dismissed: boolean) {
    const priority = dismissed ? null : detectPriority(content);
    try {
      await fetch("/api/notater/huskeliste", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
          dayOfWeek,
          content,
          priority,
        }),
      });
      setDays((prev) => ({ ...prev, [dayOfWeek]: { ...prev[dayOfWeek], priority, saved: true } }));
    } catch {
      // Nettverksfeil - la "saved: false" sta, brukeren ser at det ikke er lagret enna
    }
  }

  function dismissPriority(dayOfWeek: number) {
    setDays((prev) => ({ ...prev, [dayOfWeek]: { ...prev[dayOfWeek], dismissed: true, saved: false } }));
    persistDay(dayOfWeek, days[dayOfWeek].content, true);
  }

  function restorePriority(dayOfWeek: number) {
    setDays((prev) => ({ ...prev, [dayOfWeek]: { ...prev[dayOfWeek], dismissed: false, saved: false } }));
    persistDay(dayOfWeek, days[dayOfWeek].content, false);
  }

  function saveDay(dayOfWeek: number) {
    const day = days[dayOfWeek];
    persistDay(dayOfWeek, day.content, day.dismissed);
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
              const day = days[dayOfWeek];
              const detected = day.dismissed ? null : detectPriority(day.content);
              const style = detected ? PRIORITY_STYLES[detected] : null;
              return (
                <div
                  key={label}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-card border bg-background p-3 shadow-card transition-colors",
                    style ? "border-l-4" : "border-line",
                    style?.dot === "bg-error" && "border-l-error",
                    style?.dot === "bg-amber-500" && "border-l-amber-500",
                    style?.dot === "bg-sky-500" && "border-l-sky-500"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <div className="flex items-center gap-2">
                      {style && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground/60">
                          <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                          {style.label}
                          <button
                            type="button"
                            onClick={() => dismissPriority(dayOfWeek)}
                            aria-label="Ikke prioritet, bare tekst"
                            title="Ikke prioritet, bare tekst"
                            className="text-foreground/30 hover:text-error"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {!style && detectPriority(day.content) !== null && day.dismissed && (
                        <button
                          type="button"
                          onClick={() => restorePriority(dayOfWeek)}
                          className="text-xs text-foreground/40 hover:text-primary"
                        >
                          Bruk som prioritet likevel
                        </button>
                      )}
                      {day.saved ? (
                        day.content && (
                          <span className="inline-flex items-center gap-1 text-xs text-secondary">
                            <Check size={12} /> Lagret
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-foreground/40">Ikke lagret</span>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={day.content}
                    onChange={(e) => updateContent(dayOfWeek, e.target.value)}
                    onBlur={() => saveDay(dayOfWeek)}
                    rows={2}
                    placeholder="Skriv det du vil huske..."
                    className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          Skriv <strong>1.</strong>, <strong>2.</strong> eller <strong>3.</strong> først i teksten for å
          markere prioritet:
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-error" /> 1 = haster mest
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> 2 = viktig, ikke akutt
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" /> 3 = minst viktig
        </p>
        <p>
          Skrev du f.eks. &quot;2. Gjennomgå kapittel 5&quot; uten å mene prioritet? Trykk × ved siden av
          fargemarkøren for å fjerne den.
        </p>
      </aside>
    </div>
  );
}

function addDaysToFriday(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 4);
  return d;
}
