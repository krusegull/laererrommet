"use client";

import { monthGridDays, isSameDay, monthLabel } from "./dateUtils";
import { cn } from "@/lib/cn";
import type { CalendarEventItem } from "./EventModal";

export function YearView({
  year,
  events,
  onMonthClick,
}: {
  year: number;
  events: CalendarEventItem[];
  onMonthClick: (monthIndex: number) => void;
}) {
  const today = new Date();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const refDate = new Date(year, monthIndex, 1);
        const days = monthGridDays(refDate);
        return (
          <div
            key={monthIndex}
            role="button"
            tabIndex={0}
            onClick={() => onMonthClick(monthIndex)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onMonthClick(monthIndex);
            }}
            className="cursor-pointer rounded-card border border-line p-3 hover:border-primary"
          >
            <p className="mb-2 text-sm font-semibold text-foreground">{monthLabel(monthIndex)}</p>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day) => {
                const inMonth = day.getMonth() === monthIndex;
                const hasEvents = events.some((e) => isSameDay(new Date(e.date), day));
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded text-[9px]",
                      !inMonth && "text-foreground/20",
                      inMonth && "text-foreground/60",
                      hasEvents && inMonth && "bg-primary/15 font-semibold text-primary",
                      isSameDay(day, today) && "ring-1 ring-primary"
                    )}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
