"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { isToday } from "date-fns";

import { StatusBadge } from "@/components/projects/status-badge";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { STATUS_BAR_COLORS } from "@/lib/constants";
import { getProjectsForDay, toDateString } from "@/lib/date-utils";
import {
  getKoreanHolidayNames,
} from "@/lib/korean-holidays";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface DayCellProps {
  day: Date;
  viewYear: number;
  viewMonth: number;
  projects: Project[];
  onDayClick: (date: string) => void;
  onProjectClick: (project: Project) => void;
}

const MAX_VISIBLE_PROJECTS = 2;

export function DayCell({
  day,
  viewYear,
  viewMonth,
  projects,
  onDayClick,
  onProjectClick,
}: DayCellProps) {
  const inCurrentMonth =
    day.getFullYear() === viewYear && day.getMonth() === viewMonth;
  const isAdjacentMonth = !inCurrentMonth;
  const dayProjects = getProjectsForDay(projects, day);
  const visibleProjects = dayProjects.slice(0, MAX_VISIBLE_PROJECTS);
  const hiddenProjects = dayProjects.slice(MAX_VISIBLE_PROJECTS);
  const hiddenCount = hiddenProjects.length;
  const today = isToday(day);
  const holidayNames = getKoreanHolidayNames(day);

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
      title={holidayNames.length > 0 ? holidayNames.join(", ") : undefined}
      className={cn(
        "flex min-h-24 cursor-pointer flex-col rounded-md border p-2 text-left transition-colors hover:bg-muted/50",
        isAdjacentMonth &&
          "border-border/40 bg-muted/50 text-muted-foreground opacity-60 hover:opacity-80",
        today && "border-primary ring-1 ring-primary/30",
        today && isAdjacentMonth && "opacity-80",
      )}
    >
      <span
        className={cn(
          "mb-1 inline-flex size-6 items-center justify-center rounded-full text-sm font-medium",
          today && "bg-primary text-primary-foreground",
          holidayNames.length > 0 && !today && inCurrentMonth && "text-red-500",
          isAdjacentMonth && !today && "text-muted-foreground/70",
        )}
      >
        {day.getDate()}
      </span>

      <div className="mt-auto space-y-1">
        {visibleProjects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onProjectClick(project);
            }}
            className={cn(
              "w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white transition-opacity hover:opacity-90",
              STATUS_BAR_COLORS[project.status],
              isAdjacentMonth && "opacity-60",
            )}
            title={project.name}
          >
            {project.name}
          </button>
        ))}

        {hiddenCount > 0 && (
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="w-full text-left text-[10px] text-muted-foreground hover:text-foreground"
                />
              }
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              +{hiddenCount} 더보기
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-56 p-2"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <PopoverHeader className="px-1 pb-2">
                <PopoverTitle className="text-xs text-muted-foreground">
                  {format(day, "M월 d일", { locale: ko })} 일정 ({hiddenCount}건)
                </PopoverTitle>
              </PopoverHeader>
              <div className="space-y-1">
                {hiddenProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onProjectClick(project)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        STATUS_BAR_COLORS[project.status],
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {project.name}
                    </span>
                    <StatusBadge status={project.status} className="shrink-0 text-[10px]" />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
