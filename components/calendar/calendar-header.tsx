"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { TypeBadge } from "@/components/projects/type-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TYPE_CHECKBOX_CLASSES, TYPE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CALENDAR_VIEW_LABELS,
  type CalendarViewMode,
} from "@/types/calendar";
import type { ProjectType } from "@/types/project";

interface CalendarHeaderProps {
  year: number;
  month: number;
  viewMode: CalendarViewMode;
  selectedTypes: ProjectType[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onToggleType: (type: ProjectType, checked: boolean) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const VIEW_MODES: CalendarViewMode[] = ["month", "quarter", "year"];

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
  selectedTypes,
  onYearChange,
  onMonthChange,
  onViewModeChange,
  onToggleType,
  onPrevMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

      <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:justify-end">
        <div className="flex flex-wrap items-center gap-3">
          {TYPE_OPTIONS.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-1.5 text-sm"
            >
              <Checkbox
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => onToggleType(type, checked === true)}
                className={TYPE_CHECKBOX_CLASSES[type]}
              />
              <TypeBadge type={type} className="text-xs" />
            </label>
          ))}
        </div>

        <div className="flex rounded-lg border bg-muted/30 p-0.5">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "min-w-14 px-3",
                viewMode === mode
                  ? "bg-neutral-500 text-white hover:bg-neutral-500/90 dark:bg-neutral-600 dark:hover:bg-neutral-600/90"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
              onClick={() => onViewModeChange(mode)}
            >
              {CALENDAR_VIEW_LABELS[mode]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
