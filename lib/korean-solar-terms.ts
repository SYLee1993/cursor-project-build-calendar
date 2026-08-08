import { format } from "date-fns";
import { calculateFourPillars, getSolarTermsOfYear } from "manseryeok";

const KST_TIME_ZONE = "Asia/Seoul";

type Ymd = { year: number; month: number; day: number };

const yearLabelCache = new Map<number, Map<string, string[]>>();

function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toKstYmd(date: Date): Ymd {
  const [year, month, day] = date
    .toLocaleDateString("en-CA", { timeZone: KST_TIME_ZONE })
    .split("-")
    .map(Number);

  return { year, month, day };
}

function toYmdString({ year, month, day }: Ymd): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays({ year, month, day }: Ymd): Ymd {
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + 1);

  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function isGyeongDay({ year, month, day }: Ymd): boolean {
  const pillars = calculateFourPillars({
    year,
    month,
    day,
    hour: 12,
    minute: 0,
    gender: "male",
  });

  return pillars.day.heavenlyStem === "경";
}

function findNthGyeongDayFrom(start: Ymd, n: number): string | null {
  let current = start;
  let count = 0;

  for (let step = 0; step < 60; step += 1) {
    if (isGyeongDay(current)) {
      count += 1;
      if (count === n) {
        return toYmdString(current);
      }
    }

    current = addDays(current);
  }

  return null;
}

function addLabel(map: Map<string, string[]>, date: string, label: string) {
  const labels = map.get(date) ?? [];
  if (!labels.includes(label)) {
    labels.push(label);
  }
  map.set(date, labels);
}

function buildYearLabelMap(year: number): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const terms = getSolarTermsOfYear(year);

  for (const term of terms) {
    addLabel(map, toYmdString(toKstYmd(term.date)), term.name);
  }

  const termsByName = Object.fromEntries(
    terms.map((term) => [term.name, toKstYmd(term.date)]),
  ) as Partial<Record<string, Ymd>>;

  const haji = termsByName["하지"];
  const ipchu = termsByName["입추"];

  if (haji) {
    const chobok = findNthGyeongDayFrom(haji, 3);
    const jungbok = findNthGyeongDayFrom(haji, 4);

    if (chobok) addLabel(map, chobok, "초복");
    if (jungbok) addLabel(map, jungbok, "중복");
  }

  if (ipchu) {
    const malbok = findNthGyeongDayFrom(ipchu, 1);
    if (malbok) addLabel(map, malbok, "말복");
  }

  return map;
}

function getYearLabelMap(year: number): Map<string, string[]> {
  const cached = yearLabelCache.get(year);
  if (cached) return cached;

  const map = buildYearLabelMap(year);
  yearLabelCache.set(year, map);
  return map;
}

export function getKoreanSolarTermNames(date: Date): string[] {
  const dateKey = toDateString(date);
  return getYearLabelMap(date.getFullYear()).get(dateKey) ?? [];
}
