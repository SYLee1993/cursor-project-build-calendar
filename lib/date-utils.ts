import {
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

export function getProjectsForDay(projects: Project[], day: Date): Project[] {
  return projects.filter((project) => isDateInProjectRange(day, project));
}

export { isSameDay, isSameMonth };
