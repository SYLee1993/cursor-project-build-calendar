import {
  addDays,
  differenceInCalendarDays,
  parseISO,
  startOfDay,
} from "date-fns";

import { isDateInProjectRange, toDateString } from "@/lib/date-utils";
import type { Project } from "@/types/project";

export const EVENT_LANE_HEIGHT = 19;
export const EVENT_LANE_GAP = 4;
export const CELL_PADDING_TOP = 8;
export const DATE_HEADER_HEIGHT = 28;
export const EVENT_LAYER_TOP = CELL_PADDING_TOP + DATE_HEADER_HEIGHT;

export const COMPACT_EVENT_LANE_HEIGHT = 12;
export const COMPACT_EVENT_LANE_GAP = 2;
export const COMPACT_CELL_PADDING_TOP = 4;
export const COMPACT_DATE_HEADER_HEIGHT = 20;
export const COMPACT_EVENT_LAYER_TOP =
  COMPACT_CELL_PADDING_TOP + COMPACT_DATE_HEADER_HEIGHT;

export interface CalendarLayoutMetrics {
  eventLaneHeight: number;
  eventLaneGap: number;
  cellPaddingTop: number;
  dateHeaderHeight: number;
  eventLayerTop: number;
}

export function getLayoutMetrics(compact = false): CalendarLayoutMetrics {
  if (compact) {
    return {
      eventLaneHeight: COMPACT_EVENT_LANE_HEIGHT,
      eventLaneGap: COMPACT_EVENT_LANE_GAP,
      cellPaddingTop: COMPACT_CELL_PADDING_TOP,
      dateHeaderHeight: COMPACT_DATE_HEADER_HEIGHT,
      eventLayerTop: COMPACT_EVENT_LAYER_TOP,
    };
  }

  return {
    eventLaneHeight: EVENT_LANE_HEIGHT,
    eventLaneGap: EVENT_LANE_GAP,
    cellPaddingTop: CELL_PADDING_TOP,
    dateHeaderHeight: DATE_HEADER_HEIGHT,
    eventLayerTop: EVENT_LAYER_TOP,
  };
}

export interface WeekProjectSegment {
  project: Project;
  lane: number;
  startCol: number;
  span: number;
  showLabel: boolean;
  continuesFromPrevWeek: boolean;
  continuesToNextWeek: boolean;
}

export interface WeekLayout {
  segments: WeekProjectSegment[];
  laneCount: number;
}

export function chunkWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

function getColumnRange(
  project: Project,
  weekDays: Date[],
): { startCol: number; endCol: number } {
  const weekStart = startOfDay(weekDays[0]);
  const weekEnd = startOfDay(weekDays[6]);
  const projectStart = startOfDay(parseISO(project.startDate));
  const projectEnd = startOfDay(parseISO(project.endDate));

  const visibleStart = projectStart < weekStart ? weekStart : projectStart;
  const visibleEnd = projectEnd > weekEnd ? weekEnd : projectEnd;

  const startCol = differenceInCalendarDays(visibleStart, weekStart);
  const endCol = differenceInCalendarDays(visibleEnd, weekStart);

  return { startCol, endCol };
}

function projectOverlapsWeek(project: Project, weekDays: Date[]): boolean {
  return weekDays.some((day) => isDateInProjectRange(day, project));
}

function projectsOverlapInWeek(
  a: Project,
  b: Project,
  weekDays: Date[],
): boolean {
  const rangeA = getColumnRange(a, weekDays);
  const rangeB = getColumnRange(b, weekDays);
  return rangeA.startCol <= rangeB.endCol && rangeB.startCol <= rangeA.endCol;
}

function createSegment(
  project: Project,
  weekDays: Date[],
  lane: number,
): WeekProjectSegment {
  const weekStart = startOfDay(weekDays[0]);
  const weekEnd = startOfDay(weekDays[6]);
  const projectStart = startOfDay(parseISO(project.startDate));
  const projectEnd = startOfDay(parseISO(project.endDate));

  const visibleStart = projectStart < weekStart ? weekStart : projectStart;
  const visibleEnd = projectEnd > weekEnd ? weekEnd : projectEnd;

  const startCol = differenceInCalendarDays(visibleStart, weekStart);
  const endCol = differenceInCalendarDays(visibleEnd, weekStart);

  const continuesFromPrevWeek = projectStart < weekStart;
  const continuesToNextWeek = projectEnd > weekEnd;

  return {
    project,
    lane,
    startCol,
    span: endCol - startCol + 1,
    showLabel: !continuesFromPrevWeek,
    continuesFromPrevWeek,
    continuesToNextWeek,
  };
}

export function layoutWeekProjects(
  weekDays: Date[],
  projects: Project[],
): WeekLayout {
  const segments: WeekProjectSegment[] = [];
  const lanes: Project[][] = [];

  const weekProjects = projects
    .filter((project) => projectOverlapsWeek(project, weekDays))
    .sort((a, b) => {
      const startDiff =
        parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
      if (startDiff !== 0) return startDiff;

      const aDuration =
        parseISO(a.endDate).getTime() - parseISO(a.startDate).getTime();
      const bDuration =
        parseISO(b.endDate).getTime() - parseISO(b.startDate).getTime();
      return bDuration - aDuration;
    });

  for (const project of weekProjects) {
    let placed = false;

    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex += 1) {
      const laneProjects = lanes[laneIndex];
      const overlaps = laneProjects.some((existing) =>
        projectsOverlapInWeek(existing, project, weekDays),
      );

      if (!overlaps) {
        laneProjects.push(project);
        segments.push(createSegment(project, weekDays, laneIndex));
        placed = true;
        break;
      }
    }

    if (placed) continue;

    lanes.push([project]);
    segments.push(createSegment(project, weekDays, lanes.length - 1));
  }

  return { segments, laneCount: lanes.length };
}

export function getSegmentRoundingClasses(
  segment: Pick<
    WeekProjectSegment,
    "continuesFromPrevWeek" | "continuesToNextWeek"
  >,
): string {
  const { continuesFromPrevWeek, continuesToNextWeek } = segment;

  if (!continuesFromPrevWeek && !continuesToNextWeek) return "rounded-md";
  if (!continuesFromPrevWeek && continuesToNextWeek) return "rounded-l-md rounded-r-none";
  if (continuesFromPrevWeek && !continuesToNextWeek) return "rounded-r-md rounded-l-none";
  return "rounded-none";
}

export function getEventAreaHeight(laneCount: number, compact = false): number {
  if (laneCount === 0) return 0;
  const { eventLaneHeight, eventLaneGap } = getLayoutMetrics(compact);
  return laneCount * eventLaneHeight + (laneCount - 1) * eventLaneGap;
}

export function getShiftedPreviewSegment(
  segment: WeekProjectSegment,
  weekDays: Date[],
  dayDelta: number,
): WeekProjectSegment | null {
  if (dayDelta === 0) return null;

  const start = parseISO(segment.project.startDate);
  const end = parseISO(segment.project.endDate);
  const shiftedProject: Project = {
    ...segment.project,
    startDate: toDateString(addDays(start, dayDelta)),
    endDate: toDateString(addDays(end, dayDelta)),
  };

  if (!projectOverlapsWeek(shiftedProject, weekDays)) return null;

  const preview = createSegment(shiftedProject, weekDays, segment.lane);
  return { ...preview, showLabel: true };
}
