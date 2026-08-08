export type CalendarViewMode = "month" | "quarter" | "year";

export const CALENDAR_VIEW_LABELS: Record<CalendarViewMode, string> = {
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

export function getQuarterFromMonth(month: number): number {
  return Math.floor(month / 3) + 1;
}

export function formatQuarterLabel(year: number, month: number): string {
  return `${year}년 Q${getQuarterFromMonth(month)}`;
}

export function getAdjacentMonths(
  year: number,
  month: number,
): { year: number; month: number }[] {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  return [
    { year: prevYear, month: prevMonth },
    { year, month },
    { year: nextYear, month: nextMonth },
  ];
}

export function getYearMonths(year: number): { year: number; month: number }[] {
  return Array.from({ length: 12 }, (_, index) => ({ year, month: index }));
}
