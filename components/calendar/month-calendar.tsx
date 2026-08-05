"use client";

import { DayCell } from "@/components/calendar/day-cell";
import { WEEKDAY_LABELS } from "@/lib/constants";
import { getCalendarDays } from "@/lib/date-utils";
import type { Project } from "@/types/project";

interface MonthCalendarProps {
  year: number;
  month: number;
  projects: Project[];
  onDayClick: (date: string) => void;
  onProjectClick: (project: Project) => void;
}

export function MonthCalendar({
  year,
  month,
  projects,
  onDayClick,
  onProjectClick,
}: MonthCalendarProps) {
  const days = getCalendarDays(year, month);

  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={`py-2 text-center text-xs font-medium ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-muted-foreground"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            viewYear={year}
            viewMonth={month}
            projects={projects}
            onDayClick={onDayClick}
            onProjectClick={onProjectClick}
          />
        ))}
      </div>
    </div>
  );
}
