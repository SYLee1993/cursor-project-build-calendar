"use client";

import { createPortal } from "react-dom";

import type { ActiveDrag } from "@/hooks/use-event-drag";
import { getSegmentRoundingClasses } from "@/lib/calendar-layout";
import { TYPE_BAR_COLORS, TYPE_BAR_TEXT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EventDragOverlayProps {
  activeDrag: ActiveDrag | null;
}

export function EventDragOverlay({ activeDrag }: EventDragOverlayProps) {
  if (
    !activeDrag ||
    activeDrag.mode !== "move" ||
    !activeDrag.moved ||
    typeof document === "undefined"
  ) {
    return null;
  }

  const {
    project,
    pointerX,
    pointerY,
    grabOffsetX,
    grabOffsetY,
    dragWidth,
    dragHeight,
    compact,
    segment,
    isCopy,
  } = activeDrag;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pointerX - grabOffsetX,
        top: pointerY - grabOffsetY,
        width: dragWidth,
        height: dragHeight,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      className={cn(isCopy && "opacity-95")}
    >
      <div
        className={cn(
          "h-full truncate py-0.5 text-left font-medium shadow-md ring-2 ring-black/10 dark:ring-white/20",
          compact ? "px-1 text-[8px]" : "px-1.5 text-[10px]",
          TYPE_BAR_COLORS[project.type],
          TYPE_BAR_TEXT_COLORS[project.type],
          getSegmentRoundingClasses(segment),
        )}
      >
        {segment.showLabel ? project.name : "\u00A0"}
      </div>
    </div>,
    document.body,
  );
}
