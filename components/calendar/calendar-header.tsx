"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CALENDAR_VIEW_LABELS,
  type CalendarViewMode,
} from "@/types/calendar";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  year: number;
  month: number;
  viewMode: CalendarViewMode;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddProject: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const VIEW_MODES: CalendarViewMode[] = ["day", "month", "year"];

const YEAR_ITEMS = Array.from({ length: 11 }, (_, index) => {
  const value = CURRENT_YEAR - 5 + index;
  return { label: `${value}년`, value: String(value) };
});

const MONTH_ITEMS = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}월`,
  value: String(index),
}));

export function CalendarHeader({
  year,
  month,
  viewMode,
  onYearChange,
  onMonthChange,
  onViewModeChange,
  onPrevMonth,
  onNextMonth,
  onAddProject,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevMonth} aria-label="이전 달">
          <ChevronLeft className="size-4" />
        </Button>

        <Select
          items={YEAR_ITEMS}
          value={String(year)}
          onValueChange={(value) => onYearChange(Number(value))}
        >
          <SelectTrigger className="w-[108px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {YEAR_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          items={MONTH_ITEMS}
          value={String(month)}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="w-[88px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {MONTH_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={onNextMonth} aria-label="다음 달">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border bg-muted/30 p-0.5">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={viewMode === mode ? "default" : "ghost"}
              className={cn("min-w-14 px-3", viewMode !== mode && "hover:bg-transparent")}
              onClick={() => onViewModeChange(mode)}
            >
              {CALENDAR_VIEW_LABELS[mode]}
            </Button>
          ))}
        </div>

        <Button onClick={onAddProject}>
          <Plus className="size-4" />
          프로젝트 추가
        </Button>
      </div>
    </div>
  );
}
