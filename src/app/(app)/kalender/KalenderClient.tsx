"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { YearView } from "./YearView";
import { EventModal, type CalendarEventItem, type CalendarSubjectItem } from "./EventModal";
import { startOfWeek, addDays, monthGridDays, monthLabel, weekDays } from "./dateUtils";
import { CALENDAR_CATEGORIES, CALENDAR_CATEGORY_LABELS } from "@/lib/validations";
import { CALENDAR_CATEGORY_STYLES, subjectDotClass } from "@/lib/calendarColors";
import { cn } from "@/lib/cn";

type ViewMode = "uke" | "maned" | "ar";

export function KalenderClient() {
  const [view, setView] = useState<ViewMode>("uke");
  const [refDate, setRefDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{ open: boolean; date: Date; existing: CalendarEventItem | null }>({
    open: false,
    date: new Date(),
    existing: null,
  });
  const [subjects, setSubjects] = useState<CalendarSubjectItem[]>([]);
  const [hiddenSubjectIds, setHiddenSubjectIds] = useState<Set<string>>(new Set());
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [subjectError, setSubjectError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kalender/fag")
      .then((res) => res.json())
      .then((data) => setSubjects(data.subjects ?? []))
      .catch(() => {});
  }, []);

  const visibleEvents = useMemo(
    () => events.filter((e) => !e.subject || !hiddenSubjectIds.has(e.subject.id)),
    [events, hiddenSubjectIds]
  );

  function toggleSubjectVisibility(id: string) {
    setHiddenSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAddSubject() {
    const name = newSubjectName.trim();
    if (!name) return;
    setSubjectError(null);
    try {
      const res = await fetch("/api/kalender/fag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubjectError(data.error ?? "Klarte ikke å legge til faget.");
        return;
      }
      setSubjects((prev) => [...prev, data.subject]);
      setNewSubjectName("");
      setAddingSubject(false);
    } catch {
      setSubjectError("Nettverksfeil. Prøv igjen.");
    }
  }

  async function handleDeleteSubject(id: string) {
    if (!confirm("Slette dette faget? Hendelser som bruker faget mister fag-merkingen, men beholdes.")) return;
    await fetch(`/api/kalender/fag/${id}`, { method: "DELETE" });
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setHiddenSubjectIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const range = useMemo(() => {
    if (view === "uke") {
      const start = startOfWeek(refDate);
      return { start, end: addDays(start, 7) };
    }
    if (view === "maned") {
      const days = monthGridDays(refDate);
      return { start: days[0], end: addDays(days[days.length - 1], 1) };
    }
    const start = new Date(refDate.getFullYear(), 0, 1);
    return { start, end: new Date(refDate.getFullYear() + 1, 0, 1) };
  }, [view, refDate]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet henting ved endring av synlig periode, jf. https://react.dev/reference/react/useEffect#fetching-data-with-effects
    setLoading(true);
    fetch(`/api/kalender?start=${range.start.toISOString()}&end=${range.end.toISOString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setEvents(data.events ?? []);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  function navigate(direction: -1 | 1) {
    setRefDate((prev) => {
      if (view === "uke") return addDays(prev, 7 * direction);
      if (view === "maned") return new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      return new Date(prev.getFullYear() + direction, prev.getMonth(), 1);
    });
  }

  function openCreate(date: Date) {
    setModalState({ open: true, date, existing: null });
  }

  function openEdit(event: CalendarEventItem) {
    setModalState({ open: true, date: new Date(event.date), existing: event });
  }

  function handleSaved(event: CalendarEventItem) {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      return exists ? prev.map((e) => (e.id === event.id ? event : e)) : [...prev, event];
    });
    setModalState((s) => ({ ...s, open: false }));
  }

  function handleDeleted(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setModalState((s) => ({ ...s, open: false }));
  }

  const heading = useMemo(() => {
    if (view === "uke") {
      const days = weekDays(refDate);
      const first = days[0];
      const last = days[6];
      const sameMonth = first.getMonth() === last.getMonth();
      return sameMonth
        ? `${first.getDate()}.–${last.getDate()}. ${monthLabel(first.getMonth())} ${first.getFullYear()}`
        : `${first.getDate()}. ${monthLabel(first.getMonth())} – ${last.getDate()}. ${monthLabel(last.getMonth())} ${last.getFullYear()}`;
    }
    if (view === "maned") return `${monthLabel(refDate.getMonth())} ${refDate.getFullYear()}`;
    return `${refDate.getFullYear()}`;
  }, [view, refDate]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Forrige"
            className="rounded-button p-1.5 text-foreground/60 hover:bg-background-subtle"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setRefDate(new Date())}
            className="rounded-button border border-line px-2.5 py-1 text-xs font-medium text-foreground/70 hover:bg-background-subtle"
          >
            I dag
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Neste"
            className="rounded-button p-1.5 text-foreground/60 hover:bg-background-subtle"
          >
            <ChevronRight size={18} />
          </button>
          <p className="ml-1 font-semibold text-foreground">{heading}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-button border border-line p-0.5">
            {(["uke", "maned", "ar"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium",
                  view === v ? "bg-primary text-white" : "text-foreground/60 hover:bg-background-subtle"
                )}
              >
                {v === "uke" ? "Uke" : v === "maned" ? "Måned" : "År"}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => openCreate(new Date())}>
            <Plus size={16} /> Ny hendelse
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
        {CALENDAR_CATEGORIES.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", CALENDAR_CATEGORY_STYLES[c].dot)} />
            {CALENDAR_CATEGORY_LABELS[c]}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-button border border-line bg-background-subtle/50 px-3 py-2 text-xs">
          <span className="font-medium text-foreground/70">Fag:</span>
          {subjects.map((s) => {
            const hidden = hiddenSubjectIds.has(s.id);
            return (
              <span
                key={s.id}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
                  hidden ? "opacity-40" : ""
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSubjectVisibility(s.id)}
                  className="inline-flex items-center gap-1.5"
                  title={hidden ? `Vis ${s.name} i kalenderen` : `Skjul ${s.name} i kalenderen`}
                >
                  <span className={cn("h-2 w-2 rounded-full", subjectDotClass(s.colorIndex))} />
                  <span className="text-foreground/70">{s.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSubject(s.id)}
                  aria-label={`Slett ${s.name}`}
                  className="text-foreground/40 hover:text-error"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
          {addingSubject ? (
            <span className="inline-flex items-center gap-1">
              <input
                autoFocus
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubject();
                  if (e.key === "Escape") {
                    setAddingSubject(false);
                    setNewSubjectName("");
                  }
                }}
                placeholder="Fagnavn"
                className="w-28 rounded border border-line bg-background px-1.5 py-0.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button type="button" onClick={handleAddSubject} className="text-primary hover:underline">
                Legg til
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setAddingSubject(true)}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Plus size={12} /> Nytt fag
            </button>
          )}
          {subjectError && <span className="text-error">{subjectError}</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-primary">
          <LoadingDots />
        </div>
      ) : view === "uke" ? (
        <WeekView referenceDate={refDate} events={visibleEvents} onSlotClick={openCreate} onEventClick={openEdit} />
      ) : view === "maned" ? (
        <MonthView referenceDate={refDate} events={visibleEvents} onDayClick={openCreate} onEventClick={openEdit} />
      ) : (
        <YearView
          year={refDate.getFullYear()}
          events={visibleEvents}
          onMonthClick={(monthIndex) => {
            setRefDate(new Date(refDate.getFullYear(), monthIndex, 1));
            setView("maned");
          }}
        />
      )}

      {modalState.open && (
        <EventModal
          open={modalState.open}
          onClose={() => setModalState((s) => ({ ...s, open: false }))}
          defaultDate={modalState.date}
          existing={modalState.existing}
          subjects={subjects}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
