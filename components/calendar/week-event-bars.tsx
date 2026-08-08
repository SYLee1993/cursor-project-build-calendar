"use client";

import { useRef } from "react";

import {
  isCopyModifierPressed,
  isSameWeekDayIndex,
} from "@/hooks/use-event-drag";
import {
  getLayoutMetrics,
  getSegmentRoundingClasses,
  getShiftedPreviewSegment,
  type WeekProjectSegment,
} from "@/lib/calendar-layout";
import type { EventDragController } from "@/hooks/use-event-drag";
import { TYPE_BAR_COLORS, TYPE_BAR_TEXT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WeekEventBarsProps {
  weekDays: Date[];
  weekIndex: number;
  segments: WeekProjectSegment[];
  laneCount: number;
  isAdjacentDay: (segment: WeekProjectSegment) => boolean;
  drag: EventDragController;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  compact?: boolean;
}

function EventBarContent({
  segment,
  isAdjacentDay,
  compact = false,
}: {
  segment: WeekProjectSegment;
  isAdjacentDay: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-full truncate py-0.5 text-left font-medium transition-opacity hover:opacity-90",
        compact ? "px-1 text-[8px]" : "px-1.5 text-[10px]",
        TYPE_BAR_COLORS[segment.project.type],
        TYPE_BAR_TEXT_COLORS[segment.project.type],
        getSegmentRoundingClasses(segment),
        isAdjacentDay && "opacity-60",
      )}
    >
      {segment.showLabel ? segment.project.name : "\u00A0"}
    </div>
  );
}

function PreviewGhost({
  segment,
  isAdjacentDay,
  compact = false,
  className,
}: {
  segment: WeekProjectSegment;
  isAdjacentDay: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      style={{
        gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
      }}
      className={cn("pointer-events-none z-20 h-full", className)}
    >
      <EventBarContent
        segment={segment}
        isAdjacentDay={isAdjacentDay}
        compact={compact}
      />
    </div>
  );
}

export function WeekEventBars({
  weekDays,
  weekIndex,
  segments,
  laneCount,
  isAdjacentDay,
  drag,
  gridRef,
  compact = false,
}: WeekEventBarsProps) {
  const localGridRef = useRef<HTMLDivElement>(null);
  const eventGridRef = gridRef ?? localGridRef;
  const layout = getLayoutMetrics(compact);
  const { activeDrag, beginDrag } = drag;

  if (laneCount === 0) return null;

  const showCopySnapGhost =
    activeDrag?.mode === "move" &&
    activeDrag.moved &&
    activeDrag.isCopy &&
    activeDrag.dayDelta !== 0 &&
    !isSameWeekDayIndex(activeDrag.anchorDayIndex, activeDrag.dayDelta);

  const copySnapSegments = showCopySnapGhost
    ? segments
        .filter((segment) => segment.project.id === activeDrag.project.id)
        .map((segment) =>
          getShiftedPreviewSegment(segment, weekDays, activeDrag.dayDelta),
        )
        .filter((segment): segment is WeekProjectSegment => segment !== null)
    : [];

  return (
    <div
      className="pointer-events-none absolute inset-x-0"
      style={{ top: layout.eventLayerTop }}
    >
      {Array.from({ length: laneCount }).map((_, lane) => {
        const laneSegments = segments.filter((segment) => segment.lane === lane);
        const laneCopySnapSegments = copySnapSegments.filter(
          (segment) => segment.lane === lane,
        );

        return (
          <div
            key={lane}
            ref={lane === 0 ? eventGridRef : undefined}
            className="grid grid-cols-7 gap-1"
            style={{
              height: layout.eventLaneHeight,
              marginBottom: lane < laneCount - 1 ? layout.eventLaneGap : 0,
            }}
          >
            {laneSegments.map((segment) => {
              const isActive =
                activeDrag?.project.id === segment.project.id &&
                activeDrag.moved;
              const isMoveDrag = isActive && activeDrag.mode === "move";
              const isCopyDrag = isMoveDrag && activeDrag.isCopy;

              return (
                <div
                  key={`${segment.project.id}-${lane}`}
                  style={{
                    gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
                  }}
                  className={cn(
                    "pointer-events-auto relative h-full cursor-grab active:cursor-grabbing",
                    isMoveDrag && !isCopyDrag && "opacity-0",
                    isCopyDrag && "opacity-40",
                  )}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.stopPropagation();
                    event.preventDefault();
                    beginDrag({
                      mode: "move",
                      project: segment.project,
                      clientX: event.clientX,
                      clientY: event.clientY,
                      isCopy: isCopyModifierPressed(event),
                      weekIndex,
                      segment,
                      pointerId: event.pointerId,
                      pointerTarget: event.currentTarget,
                      compact,
                    });
                  }}
                  title={`${segment.project.name} (Ctrl+드래그 또는 드래그 중 Ctrl: 복사)`}
                >
                  {!segment.continuesFromPrevWeek && (
                    <div
                      className="absolute inset-y-0 left-0 z-20 w-2 cursor-ew-resize"
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        event.stopPropagation();
                        event.preventDefault();
                        beginDrag({
                          mode: "resize-start",
                          project: segment.project,
                          clientX: event.clientX,
                          clientY: event.clientY,
                          isCopy: false,
                          weekIndex,
                          segment,
                          pointerId: event.pointerId,
                          pointerTarget: event.currentTarget,
                          compact,
                        });
                      }}
                    />
                  )}

                  {!segment.continuesToNextWeek && (
                    <div
                      className="absolute inset-y-0 right-0 z-20 w-2 cursor-ew-resize"
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        event.stopPropagation();
                        event.preventDefault();
                        beginDrag({
                          mode: "resize-end",
                          project: segment.project,
                          clientX: event.clientX,
                          clientY: event.clientY,
                          isCopy: false,
                          weekIndex,
                          segment,
                          pointerId: event.pointerId,
                          pointerTarget: event.currentTarget,
                          compact,
                        });
                      }}
                    />
                  )}

                  <EventBarContent
                    segment={segment}
                    isAdjacentDay={isAdjacentDay(segment)}
                    compact={compact}
                  />
                </div>
              );
            })}

            {laneCopySnapSegments.map((segment) => (
              <PreviewGhost
                key={`copy-snap-${segment.project.id}-${lane}-${segment.startCol}`}
                segment={segment}
                isAdjacentDay={isAdjacentDay(segment)}
                compact={compact}
                className="ring-2 ring-white/70"
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
