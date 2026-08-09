"use client";

import { isToday } from "date-fns";

import { toDateString } from "@/lib/date-utils";
import { getKoreanHolidayNames } from "@/lib/korean-holidays";
import { getKoreanSolarTermNames } from "@/lib/korean-solar-terms";
import { cn } from "@/lib/utils";

interface DayCellProps {
  day: Date;
  viewYear: number;
  viewMonth: number;
  eventAreaHeight: number;
  compact?: boolean;
  onDayClick: (date: string) => void;
}

export function DayCell({
  day,
  viewYear,
  viewMonth,
  eventAreaHeight,
  compact = false,
  onDayClick,
}: DayCellProps) {
  const inCurrentMonth =
    day.getFullYear() === viewYear && day.getMonth() === viewMonth;
  const isAdjacentMonth = !inCurrentMonth;
  const today = isToday(day);
  const holidayNames = getKoreanHolidayNames(day);
  const solarTermNames = getKoreanSolarTermNames(day);
  const dayLabels = [...solarTermNames];
  const tooltipParts = [...holidayNames, ...dayLabels];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDayClick(toDateString(day))}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDayClick(toDateString(day));
        }
      }}
      title={tooltipParts.length > 0 ? tooltipParts.join(", ") : undefined}
      className={cn(
        "flex cursor-pointer flex-col rounded-md border text-left transition-colors hover:bg-muted/50",
        compact ? "min-h-14 p-1" : "min-h-24 p-2",
        isAdjacentMonth &&
          "border-border/40 bg-muted/50 text-muted-foreground opacity-60 hover:opacity-80",
      )}
    >
      <div className={cn("flex flex-wrap items-center gap-x-1 gap-y-0.5", compact ? "mb-0.5" : "mb-1")}>
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
            compact ? "size-5 text-[11px]" : "size-6 text-sm",
            today && "bg-neutral-500 text-white dark:bg-neutral-600 dark:text-white",
            holidayNames.length > 0 && !today && inCurrentMonth && "text-red-500",
            isAdjacentMonth && !today && "text-muted-foreground/70",
          )}
        >
          {day.getDate()}
        </span>
        {dayLabels.map((label) => (
          <span
            key={label}
            className={cn(
              "leading-none text-muted-foreground",
              compact ? "text-[9px]" : "text-[10px]",
              isAdjacentMonth && "text-muted-foreground/70",
            )}
          >
            {label}
          </span>
        ))}
      </div>

      {eventAreaHeight > 0 && (
        <div style={{ height: eventAreaHeight }} aria-hidden />
      )}
    </div>
  );
}
