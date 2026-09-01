"use client";

import { monthGridDays, isSameDay, weekdayLabel } from "./dateUtils";
import { CALENDAR_CATEGORY_STYLES, subjectDotClass } from "@/lib/calendarColors";
import { cn } from "@/lib/cn";
import type { CalendarEventItem } from "./EventModal";

const MAX_VISIBLE = 3;

export function MonthView({
  referenceDate,
  events,
  onDayClick,
  onEventClick,
}: {
  referenceDate: Date;
  events: CalendarEventItem[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEventItem) => void;
}) {
  const days = monthGridDays(referenceDate);
  const today = new Date();
  const currentMonth = referenceDate.getMonth();

  return (
    <div className="overflow-hidden rounded-card border border-line">
      <div className="grid grid-cols-7 border-b border-line bg-background-subtle">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="px-2 py-1.5 text-center text-xs font-medium text-foreground/50">
            {weekdayLabel(i)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
          const visible = dayEvents.slice(0, MAX_VISIBLE);
          const overflow = dayEvents.length - visible.length;
          const inMonth = day.getMonth() === currentMonth;
          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onDayClick(day);
              }}
              className={cn(
                "flex min-h-24 cursor-pointer flex-col gap-1 border-b border-r border-line p-1.5 text-left align-top hover:bg-background-subtle",
                !inMonth && "bg-background-subtle/50"
              )}
            >
              <span
                className={cn(
                  "self-start rounded-full px-1.5 text-xs",
                  !inMonth && "text-foreground/30",
                  inMonth && !isSameDay(day, today) && "text-foreground/70",
                  isSameDay(day, today) && "bg-primary font-semibold text-white"
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {visible.map((event) => {
                  const style = CALENDAR_CATEGORY_STYLES[event.category];
                  const useSubjectColor = event.category === "undervisning" && event.subject;
                  return (
                    <span
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          onEventClick(event);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] font-medium",
                        style.chip
                      )}
                    >
                      {useSubjectColor && (
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", subjectDotClass(event.subject!.colorIndex))} />
                      )}
                      <span className="truncate">{event.title}</span>
                    </span>
                  );
                })}
                {overflow > 0 && <span className="text-[11px] text-foreground/40">+{overflow} mer</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
