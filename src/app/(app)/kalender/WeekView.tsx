"use client";

import { useEffect, useState } from "react";
import { weekDays, weekdayLabel, isSameDay } from "./dateUtils";
import { CALENDAR_CATEGORY_STYLES, subjectBorderClass, subjectDotClass } from "@/lib/calendarColors";
import { cn } from "@/lib/cn";
import type { CalendarEventItem } from "./EventModal";

const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_HEIGHT = 48;

/**
 * Hendelser uten sluttid har ikke en varighet i skjemaet, bare et
 * klokkeslett — de regnes visuelt som å vare i denne perioden når vi
 * avgjør om to hendelser overlapper og må vises side ved side.
 */
const OVERLAP_WINDOW_MS = 60 * 60 * 1000;
const MIN_BLOCK_HEIGHT = 20;

function eventDurationMs(event: { date: string; endDate?: string | null }) {
  if (!event.endDate) return OVERLAP_WINDOW_MS;
  return new Date(event.endDate).getTime() - new Date(event.date).getTime();
}

function layoutOverlaps<T extends { date: string; endDate?: string | null }>(
  dayEvents: T[]
): { event: T; column: number; columnCount: number }[] {
  const sorted = [...dayEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const clusters: T[][] = [];
  let clusterEnd = -Infinity;
  for (const event of sorted) {
    const time = new Date(event.date).getTime();
    if (clusters.length > 0 && time < clusterEnd) {
      clusters[clusters.length - 1].push(event);
    } else {
      clusters.push([event]);
    }
    clusterEnd = Math.max(clusterEnd, time + eventDurationMs(event));
  }
  return clusters.flatMap((cluster) =>
    cluster.map((event, index) => ({ event, column: index, columnCount: cluster.length }))
  );
}

export function WeekView({
  referenceDate,
  events,
  onSlotClick,
  onEventClick,
}: {
  referenceDate: Date;
  events: CalendarEventItem[];
  onSlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEventItem) => void;
}) {
  const days = weekDays(referenceDate);
  const today = new Date();
  const [nowOffset, setNowOffset] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const hours = now.getHours() + now.getMinutes() / 60;
      if (hours >= START_HOUR && hours <= END_HOUR) {
        setNowOffset((hours - START_HOUR) * HOUR_HEIGHT);
      } else {
        setNowOffset(null);
      }
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <div className="grid min-w-[720px] grid-cols-[3rem_repeat(7,1fr)]">
        <div className="border-b border-line" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-b border-l border-line px-2 py-2 text-center text-sm",
              isSameDay(day, today) && "bg-primary/5"
            )}
          >
            <p className="font-medium text-foreground">{weekdayLabel((day.getDay() + 6) % 7)}</p>
            <p className={cn("text-xs", isSameDay(day, today) ? "font-semibold text-primary" : "text-foreground/50")}>
              {day.getDate()}.{day.getMonth() + 1}
            </p>
          </div>
        ))}

        <div className="relative col-span-8 grid grid-cols-[3rem_repeat(7,1fr)]">
          <div className="col-span-1">
            {hours.map((h) => (
              <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-line pr-1 text-right text-xs text-foreground/40">
                {h}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
            return (
              <div key={day.toISOString()} className="relative border-l border-line">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      const clicked = new Date(day);
                      clicked.setHours(h, 0, 0, 0);
                      onSlotClick(clicked);
                    }}
                    style={{ height: HOUR_HEIGHT }}
                    className="block w-full border-b border-line hover:bg-background-subtle"
                  />
                ))}

                {isSameDay(day, today) && nowOffset !== null && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-10 border-t-2 border-error"
                    style={{ top: nowOffset }}
                  />
                )}

                {layoutOverlaps(dayEvents).map(({ event, column, columnCount }) => {
                  const d = new Date(event.date);
                  const hours24 = d.getHours() + d.getMinutes() / 60;
                  const top = Math.max(0, (hours24 - START_HOUR) * HOUR_HEIGHT);
                  const height = Math.max(MIN_BLOCK_HEIGHT, (eventDurationMs(event) / (60 * 60 * 1000)) * HOUR_HEIGHT - 4);
                  const style = CALENDAR_CATEGORY_STYLES[event.category];
                  const useSubjectColor = event.category === "undervisning" && event.subject;
                  const borderClass = useSubjectColor ? subjectBorderClass(event.subject!.colorIndex) : style.border;
                  const widthPct = 100 / columnCount;
                  const startLabel = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
                  const endLabel = event.endDate
                    ? (() => {
                        const ed = new Date(event.endDate);
                        return `${ed.getHours().toString().padStart(2, "0")}:${ed.getMinutes().toString().padStart(2, "0")}`;
                      })()
                    : null;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onEventClick(event)}
                      style={{
                        top,
                        height,
                        left: `${column * widthPct}%`,
                        width: `calc(${widthPct}% - 2px)`,
                      }}
                      className={cn(
                        "absolute z-20 flex items-center gap-1 truncate rounded-button border-l-2 px-1.5 py-0.5 text-left text-xs font-medium shadow-sm",
                        style.chip,
                        borderClass
                      )}
                    >
                      {useSubjectColor && (
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", subjectDotClass(event.subject!.colorIndex))} />
                      )}
                      <span className="truncate">
                        {startLabel}
                        {endLabel ? `–${endLabel}` : ""} {event.title}
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
  );
}
