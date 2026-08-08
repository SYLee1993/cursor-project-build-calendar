import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";

import type { Project } from "@/types/project";

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateString(value: string): Date {
  return parseISO(value);
}

export function formatDisplayDate(value: string): string {
  return format(parseISO(value), "M/d", { locale: ko });
}

export function formatMonthYear(year: number, month: number): string {
  return format(new Date(year, month, 1), "yyyy년 M월", { locale: ko });
}

export function getCalendarDays(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function isDateInProjectRange(date: Date, project: Project): boolean {
  const start = parseISO(project.startDate);
  const end = parseISO(project.endDate);
  return isWithinInterval(date, { start, end });
}

export function projectOverlapsYear(
  project: Project,
  year: number,
): boolean {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
  const projectStart = parseISO(project.startDate);
  const projectEnd = parseISO(project.endDate);

  return projectStart <= yearEnd && projectEnd >= yearStart;
}

export function projectOverlapsMonth(
  project: Project,
  year: number,
  month: number,
): boolean {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);
  const projectStart = parseISO(project.startDate);
  const projectEnd = parseISO(project.endDate);

  return projectStart <= monthEnd && projectEnd >= monthStart;
}

export function projectOverlapsQuarter(
  project: Project,
  year: number,
  quarter: number,
): boolean {
  const startMonth = (quarter - 1) * 3;
  const quarterStart = startOfMonth(new Date(year, startMonth, 1));
  const quarterEnd = endOfMonth(new Date(year, startMonth + 2, 1));
  const projectStart = parseISO(project.startDate);
  const projectEnd = parseISO(project.endDate);

  return projectStart <= quarterEnd && projectEnd >= quarterStart;
}

export function getProjectsForDay(projects: Project[], day: Date): Project[] {
  return projects.filter((project) => isDateInProjectRange(day, project));
}

export function shiftProjectDates(
  project: Project,
  dayDelta: number,
): Pick<Project, "startDate" | "endDate"> {
  const start = parseISO(project.startDate);
  const end = parseISO(project.endDate);

  return {
    startDate: toDateString(addDays(start, dayDelta)),
    endDate: toDateString(addDays(end, dayDelta)),
  };
}

export function resizeProjectStart(
  project: Project,
  dayDelta: number,
): Pick<Project, "startDate" | "endDate"> {
  const start = parseISO(project.startDate);
  const end = parseISO(project.endDate);
  const nextStart = addDays(start, dayDelta);

  if (nextStart > end) {
    return { startDate: toDateString(end), endDate: project.endDate };
  }

  return { startDate: toDateString(nextStart), endDate: project.endDate };
}

export function resizeProjectEnd(
  project: Project,
  dayDelta: number,
): Pick<Project, "startDate" | "endDate"> {
  const start = parseISO(project.startDate);
  const end = parseISO(project.endDate);
  const nextEnd = addDays(end, dayDelta);

  if (nextEnd < start) {
    return { startDate: project.startDate, endDate: toDateString(start) };
  }

  return { startDate: project.startDate, endDate: toDateString(nextEnd) };
}

export { isSameDay, isSameMonth };
