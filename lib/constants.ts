import type { ProjectStatus } from "@/types/project";

export const STORAGE_KEY = "build-calendar:projects";

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "개발완료",
  scheduled: "개발예정",
  in_progress: "개발중",
  pending: "개발펜딩",
  cancelled: "개발취소",
};

export const STATUS_OPTIONS: ProjectStatus[] = [
  "completed",
  "scheduled",
  "in_progress",
  "pending",
  "cancelled",
];

export const STATUS_BAR_COLORS: Record<ProjectStatus, string> = {
  completed: "bg-violet-500",
  scheduled: "bg-blue-500",
  in_progress: "bg-green-500",
  pending: "bg-amber-500",
  cancelled: "bg-muted-foreground/50",
};

export const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  completed:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  in_progress: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  cancelled: "bg-muted text-muted-foreground",
};

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
