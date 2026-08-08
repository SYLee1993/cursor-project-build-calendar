"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  resizeProjectEnd,
  resizeProjectStart,
  shiftProjectDates,
} from "@/lib/date-utils";
import type { Project } from "@/types/project";
import type { WeekProjectSegment } from "@/lib/calendar-layout";

export type EventDragMode = "move" | "resize-start" | "resize-end";

export interface ActiveDrag {
  mode: EventDragMode;
  project: Project;
  startX: number;
  startY: number;
  pointerX: number;
  pointerY: number;
  grabOffsetX: number;
  grabOffsetY: number;
  dragWidth: number;
  dragHeight: number;
  dayDelta: number;
  moved: boolean;
  isCopy: boolean;
  anchorDayIndex: number;
  compact: boolean;
  segment: Pick<
    WeekProjectSegment,
    "showLabel" | "continuesFromPrevWeek" | "continuesToNextWeek"
  >;
}

export interface EventDragController {
  activeDrag: ActiveDrag | null;
  getColumnWidth: () => number;
  getColumnStep: () => number;
  beginDrag: (params: BeginDragParams) => void;
}

export interface BeginDragParams {
  mode: EventDragMode;
  project: Project;
  clientX: number;
  clientY: number;
  isCopy: boolean;
  weekIndex: number;
  segment: WeekProjectSegment;
  pointerId: number;
  pointerTarget: HTMLElement;
  compact?: boolean;
}

interface UseEventDragOptions {
  weeksContainerRef: React.RefObject<HTMLDivElement | null>;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onProjectDatesChange: (
    projectId: string,
    dates: Pick<Project, "startDate" | "endDate">,
  ) => void;
  onProjectCopy: (
    project: Project,
    dates: Pick<Project, "startDate" | "endDate">,
  ) => void;
  onProjectClick: (project: Project) => void;
}

const GRID_GAP_PX = 4;

function getColumnFromClientX(
  clientX: number,
  gridRect: DOMRect,
  columnWidth: number,
): number {
  const columnStep = columnWidth + GRID_GAP_PX;
  const raw = (clientX - gridRect.left) / columnStep;
  return Math.max(0, Math.min(6, Math.floor(raw)));
}

function getWeekIndexFromY(clientY: number, weekRows: HTMLElement[]): number {
  for (let index = 0; index < weekRows.length; index += 1) {
    const rowRect = weekRows[index].getBoundingClientRect();
    if (clientY >= rowRect.top && clientY <= rowRect.bottom) {
      return index;
    }
  }

  let closestIndex = 0;
  let closestDistance = Infinity;

  for (let index = 0; index < weekRows.length; index += 1) {
    const rowRect = weekRows[index].getBoundingClientRect();
    const distance =
      clientY < rowRect.top
        ? rowRect.top - clientY
        : clientY > rowRect.bottom
          ? clientY - rowRect.bottom
          : 0;

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}

function getGridMetrics(container: HTMLElement) {
  const weekRows = Array.from(
    container.querySelectorAll<HTMLElement>("[data-week-row]"),
  );
  if (weekRows.length === 0) return null;

  const dayGrid = weekRows[0].querySelector<HTMLElement>("[data-day-grid]");
  if (!dayGrid) return null;

  const gridRect = dayGrid.getBoundingClientRect();
  const columnWidth = (gridRect.width - GRID_GAP_PX * 6) / 7;
  if (columnWidth <= 0) return null;

  return { weekRows, gridRect, columnWidth };
}

export function getPointerDayIndex(
  clientX: number,
  clientY: number,
  container: HTMLElement | null,
): number | null {
  if (!container) return null;

  const metrics = getGridMetrics(container);
  if (!metrics) return null;

  const { weekRows, gridRect, columnWidth } = metrics;
  const weekIndex = getWeekIndexFromY(clientY, weekRows);
  const col = getColumnFromClientX(clientX, gridRect, columnWidth);

  return weekIndex * 7 + col;
}

function getMoveDayDeltaFromPointer(
  clientX: number,
  clientY: number,
  startX: number,
  startY: number,
  anchorDayIndex: number,
  container: HTMLElement | null,
): number {
  const metrics = container ? getGridMetrics(container) : null;
  if (!metrics) return 0;

  const { weekRows, columnWidth } = metrics;
  const columnStep = columnWidth + GRID_GAP_PX;
  const colDelta = Math.round((clientX - startX) / columnStep);

  const originWeekIndex = Math.floor(anchorDayIndex / 7);
  const originRow = weekRows[originWeekIndex];
  if (!originRow) return colDelta;

  const originRect = originRow.getBoundingClientRect();
  let rowStep = originRect.height + GRID_GAP_PX;
  if (originWeekIndex < weekRows.length - 1) {
    const nextRect = weekRows[originWeekIndex + 1].getBoundingClientRect();
    rowStep = nextRect.top - originRect.top;
  }

  const weekDelta = Math.round((clientY - startY) / rowStep);
  return weekDelta * 7 + colDelta;
}

export function isSameWeekDayIndex(dayIndex: number, dayDelta: number): boolean {
  const targetDayIndex = dayIndex + dayDelta;
  return Math.floor(dayIndex / 7) === Math.floor(targetDayIndex / 7);
}

export function useEventDrag({
  weeksContainerRef,
  gridRef,
  onProjectDatesChange,
  onProjectCopy,
  onProjectClick,
}: UseEventDragOptions): EventDragController {
  const dragRef = useRef<ActiveDrag | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

  const getColumnWidth = useCallback(() => {
    const element = gridRef.current;
    if (!element) return 0;

    const { width } = element.getBoundingClientRect();
    return (width - GRID_GAP_PX * 6) / 7;
  }, [gridRef]);

  const getColumnStep = useCallback(() => {
    const columnWidth = getColumnWidth();
    return columnWidth > 0 ? columnWidth + GRID_GAP_PX : 0;
  }, [getColumnWidth]);

  const getHorizontalDayDelta = useCallback(
    (clientX: number, startX: number) => {
      const columnStep = getColumnStep();
      if (columnStep === 0) return 0;
      return Math.round((clientX - startX) / columnStep);
    },
    [getColumnStep],
  );

  const getMoveDayDelta = useCallback(
    (
      clientX: number,
      clientY: number,
      startX: number,
      startY: number,
      anchorDayIndex: number,
    ) =>
      getMoveDayDeltaFromPointer(
        clientX,
        clientY,
        startX,
        startY,
        anchorDayIndex,
        weeksContainerRef.current,
      ),
    [weeksContainerRef],
  );

  const startDrag = useCallback((params: BeginDragParams) => {
    const container = weeksContainerRef.current;
    const metrics = container ? getGridMetrics(container) : null;

    let anchorCol = params.segment.startCol;
    if (metrics) {
      const col = getColumnFromClientX(
        params.clientX,
        metrics.gridRect,
        metrics.columnWidth,
      );
      anchorCol = Math.max(
        params.segment.startCol,
        Math.min(params.segment.startCol + params.segment.span - 1, col),
      );
    }

    const rect = params.pointerTarget.getBoundingClientRect();

    const nextDrag: ActiveDrag = {
      mode: params.mode,
      project: params.project,
      startX: params.clientX,
      startY: params.clientY,
      pointerX: params.clientX,
      pointerY: params.clientY,
      grabOffsetX: params.clientX - rect.left,
      grabOffsetY: params.clientY - rect.top,
      dragWidth: rect.width,
      dragHeight: rect.height,
      dayDelta: 0,
      moved: false,
      isCopy: params.isCopy,
      anchorDayIndex: params.weekIndex * 7 + anchorCol,
      compact: params.compact ?? false,
      segment: {
        showLabel: params.segment.showLabel,
        continuesFromPrevWeek: params.segment.continuesFromPrevWeek,
        continuesToNextWeek: params.segment.continuesToNextWeek,
      },
    };

    params.pointerTarget.setPointerCapture(params.pointerId);
    dragRef.current = nextDrag;
    setActiveDrag(nextDrag);
  }, [weeksContainerRef]);

  useEffect(() => {
    const syncCopyState = (drag: ActiveDrag, isCopy: boolean) => {
      if (drag.mode !== "move" || drag.isCopy === isCopy) return drag;

      drag.isCopy = isCopy;
      document.body.style.cursor = isCopy ? "copy" : "grabbing";
      setActiveDrag({ ...drag });
      return drag;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dayDelta =
        drag.mode === "move"
          ? getMoveDayDelta(
              event.clientX,
              event.clientY,
              drag.startX,
              drag.startY,
              drag.anchorDayIndex,
            )
          : getHorizontalDayDelta(event.clientX, drag.startX);

      if (
        dayDelta !== 0 ||
        Math.abs(event.clientX - drag.startX) > 3 ||
        Math.abs(event.clientY - drag.startY) > 3
      ) {
        drag.moved = true;
      }

      drag.dayDelta = dayDelta;
      drag.pointerX = event.clientX;
      drag.pointerY = event.clientY;
      syncCopyState(drag, isCopyModifierPressed(event));
      setActiveDrag({ ...drag });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (event.key !== "Control" && event.key !== "Meta") return;
      syncCopyState(drag, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (event.key !== "Control" && event.key !== "Meta") return;
      syncCopyState(drag, false);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      dragRef.current = null;
      setActiveDrag(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (!drag.moved) {
        onProjectClick(drag.project);
        return;
      }

      if (drag.dayDelta === 0) return;

      let dates: Pick<Project, "startDate" | "endDate">;
      if (drag.mode === "move") {
        dates = shiftProjectDates(drag.project, drag.dayDelta);
      } else if (drag.mode === "resize-start") {
        dates = resizeProjectStart(drag.project, drag.dayDelta);
      } else {
        dates = resizeProjectEnd(drag.project, drag.dayDelta);
      }

      const shouldCopy =
        drag.mode === "move" &&
        (drag.isCopy || isCopyModifierPressed(event));

      if (shouldCopy) {
        onProjectCopy(drag.project, dates);
        return;
      }

      onProjectDatesChange(drag.project.id, dates);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    getHorizontalDayDelta,
    getMoveDayDelta,
    onProjectClick,
    onProjectCopy,
    onProjectDatesChange,
  ]);

  const beginDrag = useCallback(
    (params: BeginDragParams) => {
      document.body.style.cursor =
        params.isCopy && params.mode === "move"
          ? "copy"
          : params.mode === "move"
            ? "grabbing"
            : "ew-resize";
      document.body.style.userSelect = "none";
      startDrag(params);
    },
    [startDrag],
  );

  return {
    activeDrag,
    getColumnWidth,
    getColumnStep,
    beginDrag,
  };
}

export function getPreviewSegmentLayout(
  segment: {
    startCol: number;
    span: number;
    continuesFromPrevWeek: boolean;
    continuesToNextWeek: boolean;
  },
  dayDelta: number,
  mode: EventDragMode | null,
): { startCol: number; span: number } {
  if (!mode || dayDelta === 0) {
    return { startCol: segment.startCol, span: segment.span };
  }

  if (mode === "move") {
    return { startCol: segment.startCol + dayDelta, span: segment.span };
  }

  if (mode === "resize-start" && !segment.continuesFromPrevWeek) {
    const nextStartCol = segment.startCol + dayDelta;
    const nextSpan = segment.span - dayDelta;

    if (nextSpan < 1) {
      return { startCol: segment.startCol + segment.span - 1, span: 1 };
    }

    return { startCol: nextStartCol, span: nextSpan };
  }

  if (mode === "resize-end" && !segment.continuesToNextWeek) {
    const nextSpan = segment.span + dayDelta;
    return { startCol: segment.startCol, span: Math.max(1, nextSpan) };
  }

  return { startCol: segment.startCol, span: segment.span };
}

export function isCopyModifierPressed(event: { ctrlKey: boolean; metaKey: boolean }) {
  return event.ctrlKey || event.metaKey;
}
