import Holidays from "date-holidays";

let krHolidays: Holidays | null = null;

function getKrHolidays() {
  if (!krHolidays) {
    krHolidays = new Holidays("KR");
  }
  return krHolidays;
}

export function getKoreanHolidayNames(date: Date): string[] {
  const holidays = getKrHolidays().isHoliday(date);
  if (!holidays) return [];
  return holidays.map((holiday) => holiday.name);
}

export function isKoreanHoliday(date: Date): boolean {
  return getKoreanHolidayNames(date).length > 0;
}
