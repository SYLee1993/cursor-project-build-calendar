"use client";

import { useMemo } from "react";

import { DayCell } from "@/components/calendar/day-cell";
import { WeekEventBars } from "@/components/calendar/week-event-bars";
import { getEventAreaHeight, layoutWeekProjects } from "@/lib/calendar-layout";
import type { EventDragController } from "@/hooks/use-event-drag";
import type { Project } from "@/types/project";

interface CalendarWeekRowProps {
  weekDays: Date[];
  weekIndex: number;
  viewYear: number;
  viewMonth: number;
  projects: Project[];
  drag: EventDragController;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  onDayClick: (date: string) => void;
  compact?: boolean;
}

export function CalendarWeekRow({
  weekDays,
  weekIndex,
  viewYear,
  viewMonth,
  projects,
  drag,
  gridRef,
  onDayClick,
  compact = false,
}: CalendarWeekRowProps) {
  const { segments, laneCount } = useMemo(
    () => layoutWeekProjects(weekDays, projects),
    [weekDays, projects],
  );
  const eventAreaHeight = getEventAreaHeight(laneCount, compact);

  const isAdjacentDay = (segment: { startCol: number }) => {
    const day = weekDays[segment.startCol];
    return day.getFullYear() !== viewYear || day.getMonth() !== viewMonth;
  };

  return (
    <div className="relative" data-week-row={weekIndex}>
      <div className="grid grid-cols-7 gap-1" data-day-grid>
        {weekDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            viewYear={viewYear}
            viewMonth={viewMonth}
            eventAreaHeight={eventAreaHeight}
            compact={compact}
            onDayClick={onDayClick}
          />
        ))}
      </div>

      <WeekEventBars
        weekDays={weekDays}
        weekIndex={weekIndex}
        segments={segments}
        laneCount={laneCount}
        isAdjacentDay={isAdjacentDay}
        drag={drag}
        gridRef={gridRef}
        compact={compact}
      />
    </div>
  );
}
