"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { YearView } from "./YearView";
import { EventModal, type CalendarEventItem } from "./EventModal";
import { startOfWeek, addDays, monthGridDays, monthLabel, weekDays } from "./dateUtils";
import { CALENDAR_CATEGORIES, CALENDAR_CATEGORY_LABELS } from "@/lib/validations";
import { CALENDAR_CATEGORY_STYLES } from "@/lib/calendarColors";
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

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-primary">
          <LoadingDots />
        </div>
      ) : view === "uke" ? (
        <WeekView referenceDate={refDate} events={events} onSlotClick={openCreate} onEventClick={openEdit} />
      ) : view === "maned" ? (
        <MonthView referenceDate={refDate} events={events} onDayClick={openCreate} onEventClick={openEdit} />
      ) : (
        <YearView
          year={refDate.getFullYear()}
          events={events}
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
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
