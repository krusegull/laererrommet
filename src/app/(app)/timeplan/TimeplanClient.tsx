"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { Input } from "@/components/ui/Input";
import { EntryModal, type TimetableEntryItem } from "./EntryModal";
import { timeToMinutes, isDateInRange } from "./timeUtils";
import { TIMETABLE_DAY_LABELS } from "@/lib/validations";
import { subjectDotClass, subjectBorderClass } from "@/lib/calendarColors";
import type { CalendarSubjectItem } from "../kalender/EventModal";
import { cn } from "@/lib/cn";

const START_HOUR = 7;
const END_HOUR = 17;
const HOUR_HEIGHT = 48;
const MIN_BLOCK_HEIGHT = 20;

interface SchoolBreakItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

function layoutDay(entries: TimetableEntryItem[]): { entry: TimetableEntryItem; column: number; columnCount: number }[] {
  const sorted = [...entries].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const clusters: TimetableEntryItem[][] = [];
  let clusterEnd = -Infinity;
  for (const entry of sorted) {
    const start = timeToMinutes(entry.startTime);
    if (clusters.length > 0 && start < clusterEnd) {
      clusters[clusters.length - 1].push(entry);
    } else {
      clusters.push([entry]);
    }
    clusterEnd = Math.max(clusterEnd, timeToMinutes(entry.endTime));
  }
  return clusters.flatMap((cluster) =>
    cluster.map((entry, index) => ({ entry, column: index, columnCount: cluster.length }))
  );
}

export function TimeplanClient() {
  const [entries, setEntries] = useState<TimetableEntryItem[]>([]);
  const [subjects, setSubjects] = useState<CalendarSubjectItem[]>([]);
  const [breaks, setBreaks] = useState<SchoolBreakItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    open: boolean;
    dayOfWeek: number;
    startTime: string;
    existing: TimetableEntryItem | null;
  }>({ open: false, dayOfWeek: 0, startTime: "08:00", existing: null });

  const [addingBreak, setAddingBreak] = useState(false);
  const [breakName, setBreakName] = useState("");
  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");
  const [breakError, setBreakError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/timeplan").then((r) => r.json()),
      fetch("/api/kalender/fag").then((r) => r.json()),
      fetch("/api/timeplan/ferie").then((r) => r.json()),
    ])
      .then(([timeplanData, fagData, ferieData]) => {
        setEntries(timeplanData.entries ?? []);
        setSubjects(fagData.subjects ?? []);
        setBreaks(ferieData.breaks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentBreak = useMemo(() => {
    const today = new Date();
    return breaks.find((b) => isDateInRange(today, new Date(b.startDate), new Date(b.endDate))) ?? null;
  }, [breaks]);

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  function openCreate(dayOfWeek: number, hour: number) {
    setModalState({
      open: true,
      dayOfWeek,
      startTime: `${String(hour).padStart(2, "0")}:00`,
      existing: null,
    });
  }

  function openEdit(entry: TimetableEntryItem) {
    setModalState({ open: true, dayOfWeek: entry.dayOfWeek, startTime: entry.startTime, existing: entry });
  }

  function handleSaved(entry: TimetableEntryItem) {
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [...prev, entry];
    });
    setModalState((s) => ({ ...s, open: false }));
  }

  function handleDeleted(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setModalState((s) => ({ ...s, open: false }));
  }

  async function handleAddBreak() {
    if (!breakName.trim() || !breakStart || !breakEnd) {
      setBreakError("Fyll ut navn, startdato og sluttdato.");
      return;
    }
    setBreakError(null);
    try {
      const res = await fetch("/api/timeplan/ferie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: breakName,
          startDate: new Date(breakStart).toISOString(),
          endDate: new Date(breakEnd).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBreakError(data.error ?? "Klarte ikke å legge til ferieperioden.");
        return;
      }
      setBreaks((prev) => [...prev, data.schoolBreak]);
      setBreakName("");
      setBreakStart("");
      setBreakEnd("");
      setAddingBreak(false);
    } catch {
      setBreakError("Nettverksfeil. Prøv igjen.");
    }
  }

  async function handleDeleteBreak(id: string) {
    if (!confirm("Slette denne ferieperioden?")) return;
    await fetch(`/api/timeplan/ferie/${id}`, { method: "DELETE" });
    setBreaks((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-primary">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {currentBreak && (
        <div className="flex items-center gap-2 rounded-button border border-line bg-background-subtle px-3 py-2 text-sm text-foreground/70">
          <CalendarOff size={16} className="shrink-0 text-primary" />
          Denne uken er ferie: <span className="font-medium text-foreground">{currentBreak.name}</span> —
          timeplanen under gjelder ikke.
        </div>
      )}

      <div className="overflow-x-auto rounded-card border border-line">
        <div className="grid min-w-[720px] grid-cols-[3.5rem_repeat(5,1fr)]">
          <div className="border-b border-line" />
          {TIMETABLE_DAY_LABELS.map((label) => (
            <div key={label} className="border-b border-l border-line px-2 py-2 text-center text-sm font-medium text-foreground">
              {label}
            </div>
          ))}

          <div className="relative col-span-6 grid grid-cols-[3.5rem_repeat(5,1fr)]">
            <div className="col-span-1">
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-line pr-1 text-right text-xs text-foreground/40"
                >
                  {h}:00
                </div>
              ))}
            </div>

            {TIMETABLE_DAY_LABELS.map((_, dayOfWeek) => {
              const dayEntries = entries.filter((e) => e.dayOfWeek === dayOfWeek);
              return (
                <div key={dayOfWeek} className="relative border-l border-line">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => openCreate(dayOfWeek, h)}
                      style={{ height: HOUR_HEIGHT }}
                      className="block w-full border-b border-line hover:bg-background-subtle"
                    />
                  ))}

                  {layoutDay(dayEntries).map(({ entry, column, columnCount }) => {
                    const startMin = timeToMinutes(entry.startTime);
                    const endMin = timeToMinutes(entry.endTime);
                    const top = Math.max(0, ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT);
                    const height = Math.max(MIN_BLOCK_HEIGHT, ((endMin - startMin) / 60) * HOUR_HEIGHT - 4);
                    const widthPct = 100 / columnCount;
                    const borderClass = entry.subject ? subjectBorderClass(entry.subject.colorIndex) : "border-primary";
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => openEdit(entry)}
                        style={{
                          top,
                          height,
                          left: `${column * widthPct}%`,
                          width: `calc(${widthPct}% - 2px)`,
                        }}
                        className={cn(
                          "absolute z-20 flex items-center gap-1 truncate rounded-button border-l-2 bg-primary/10 px-1.5 py-0.5 text-left text-xs font-medium text-primary shadow-sm",
                          borderClass
                        )}
                      >
                        {entry.subject && (
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", subjectDotClass(entry.subject.colorIndex))} />
                        )}
                        <span className="truncate">
                          {entry.startTime}–{entry.endTime} {entry.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-button border border-line bg-background-subtle/50 px-3 py-2 text-sm">
        <span className="font-medium text-foreground/70">Ferie/fridager:</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          {breaks.map((b) => (
            <span key={b.id} className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5">
              <span className="text-foreground/70">
                {b.name} ({new Date(b.startDate).toLocaleDateString("nb-NO")}–
                {new Date(b.endDate).toLocaleDateString("nb-NO")})
              </span>
              <button
                type="button"
                onClick={() => handleDeleteBreak(b.id)}
                aria-label={`Slett ${b.name}`}
                className="text-foreground/40 hover:text-error"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {addingBreak ? (
            <span className="flex flex-wrap items-end gap-2">
              <Input label="Navn" value={breakName} onChange={(e) => setBreakName(e.target.value)} className="w-32" />
              <Input label="Fra" type="date" value={breakStart} onChange={(e) => setBreakStart(e.target.value)} />
              <Input label="Til" type="date" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} />
              <Button size="sm" onClick={handleAddBreak}>
                Legg til
              </Button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setAddingBreak(true)}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Plus size={12} /> Ny ferieperiode
            </button>
          )}
        </div>
        {breakError && <span className="text-xs text-error">{breakError}</span>}
      </div>

      {modalState.open && (
        <EntryModal
          open={modalState.open}
          onClose={() => setModalState((s) => ({ ...s, open: false }))}
          defaultDayOfWeek={modalState.dayOfWeek}
          defaultStartTime={modalState.startTime}
          existing={modalState.existing}
          subjects={subjects}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
