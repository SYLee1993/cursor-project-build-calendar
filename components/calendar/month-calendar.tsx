"use client";

import { useRef } from "react";

import { CalendarWeekRow } from "@/components/calendar/calendar-week-row";
import { EventDragOverlay } from "@/components/calendar/event-drag-overlay";
import { useEventDrag } from "@/hooks/use-event-drag";
import { WEEKDAY_LABELS } from "@/lib/constants";
import { chunkWeeks } from "@/lib/calendar-layout";
import { getCalendarDays } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface MonthCalendarProps {
  year: number;
  month: number;
  projects: Project[];
  compact?: boolean;
  showTitle?: boolean;
  showWeekdays?: boolean;
  className?: string;
  onDayClick: (date: string) => void;
  onProjectClick: (project: Project) => void;
  onProjectDatesChange: (
    projectId: string,
    dates: Pick<Project, "startDate" | "endDate">,
  ) => void;
  onProjectCopy: (
    project: Project,
    dates: Pick<Project, "startDate" | "endDate">,
  ) => void;
}

export function MonthCalendar({
  year,
  month,
  projects,
  compact = false,
  showTitle = false,
  showWeekdays = true,
  className,
  onDayClick,
  onProjectClick,
  onProjectDatesChange,
  onProjectCopy,
}: MonthCalendarProps) {
  const days = getCalendarDays(year, month);
  const weeks = chunkWeeks(days);
  const weeksContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const drag = useEventDrag({
    weeksContainerRef,
    gridRef,
    onProjectDatesChange,
    onProjectCopy,
    onProjectClick,
  });

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        compact ? "p-2" : "p-3 sm:p-4",
        className,
      )}
    >
      {showTitle && (
        <h3 className={cn("font-semibold", compact ? "mb-1 text-xs" : "mb-2 text-sm")}>
          {year}년 {month + 1}월
        </h3>
      )}

      {showWeekdays && (
        <div className={cn("grid grid-cols-7 gap-1", compact ? "mb-1" : "mb-2")}>
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={cn(
                "text-center font-medium",
                compact ? "py-0.5 text-[9px]" : "py-2 text-xs",
                index === 0
                  ? "text-red-500"
                  : index === 6
                    ? "text-blue-500"
                    : "text-muted-foreground",
              )}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      <div ref={weeksContainerRef} className="space-y-1">
        {weeks.map((weekDays, weekIndex) => (
          <CalendarWeekRow
            key={weekDays[0].toISOString()}
            weekDays={weekDays}
            weekIndex={weekIndex}
            viewYear={year}
            viewMonth={month}
            projects={projects}
            drag={drag}
            gridRef={weekIndex === 0 ? gridRef : undefined}
            compact={compact}
            onDayClick={onDayClick}
          />
        ))}
      </div>

      <EventDragOverlay activeDrag={drag.activeDrag} />
    </div>
  );
}

interface MonthCalendarSharedProps {
  projects: Project[];
  onDayClick: (date: string) => void;
  onProjectClick: (project: Project) => void;
  onProjectDatesChange: (
    projectId: string,
    dates: Pick<Project, "startDate" | "endDate">,
  ) => void;
  onProjectCopy: (
    project: Project,
    dates: Pick<Project, "startDate" | "endDate">,
  ) => void;
}

export function QuarterCalendarGrid({
  months,
  shared,
}: {
  months: { year: number; month: number }[];
  shared: MonthCalendarSharedProps;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      {months.map(({ year, month }) => (
        <MonthCalendar
          key={`${year}-${month}`}
          year={year}
          month={month}
          compact
          showTitle
          {...shared}
        />
      ))}
    </div>
  );
}

export function YearCalendarGrid({
  year,
  shared,
}: {
  year: number;
  shared: MonthCalendarSharedProps;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 12 }, (_, month) => (
        <MonthCalendar
          key={`${year}-${month}`}
          year={year}
          month={month}
          compact
          showTitle
          {...shared}
        />
      ))}
    </div>
  );
}
