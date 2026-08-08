import type { ProjectStatus, ProjectType } from "@/types/project";

export const STORAGE_KEY = "build-calendar:projects";

export const TYPE_LABELS: Record<ProjectType, string> = {
  work: "Company",
  cursor_project: "Project",
  workout: "Workout",
  personal: "Personal",
  key_event: "Key Event",
};

export const TYPE_OPTIONS: ProjectType[] = [
  "work",
  "cursor_project",
  "workout",
  "personal",
  "key_event",
];

export const TYPE_BADGE_CLASSES: Record<ProjectType, string> = {
  work: "bg-neutral-200 text-neutral-800 dark:bg-neutral-300 dark:text-neutral-900",
  cursor_project: "bg-yellow-400 text-yellow-950 dark:bg-yellow-400 dark:text-yellow-950",
  workout: "bg-green-500 text-white dark:bg-green-500 dark:text-white",
  personal: "bg-sky-400 text-white dark:bg-sky-400 dark:text-white",
  key_event: "bg-red-500 text-white dark:bg-red-500 dark:text-white",
};

export const TYPE_BAR_COLORS: Record<ProjectType, string> = {
  work: "bg-neutral-300 dark:bg-neutral-400",
  cursor_project: "bg-yellow-400",
  workout: "bg-green-500",
  personal: "bg-sky-400",
  key_event: "bg-red-500",
};

export const TYPE_BAR_TEXT_COLORS: Record<ProjectType, string> = {
  work: "text-neutral-800 dark:text-neutral-900",
  cursor_project: "text-yellow-950",
  workout: "text-white",
  personal: "text-white",
  key_event: "text-white",
};

export const TYPE_CHECKBOX_CLASSES: Record<ProjectType, string> = {
  work: "border-neutral-400/70 data-checked:border-neutral-400 data-checked:bg-neutral-300 data-checked:text-neutral-900 dark:data-checked:bg-neutral-400 dark:data-checked:text-neutral-900",
  cursor_project:
    "border-yellow-400/70 data-checked:border-yellow-400 data-checked:bg-yellow-400 data-checked:text-yellow-950 dark:data-checked:bg-yellow-400 dark:data-checked:text-yellow-950",
  workout:
    "border-green-500/70 data-checked:border-green-500 data-checked:bg-green-500 data-checked:text-white dark:data-checked:bg-green-500 dark:data-checked:text-white",
  personal:
    "border-sky-400/70 data-checked:border-sky-400 data-checked:bg-sky-400 data-checked:text-white dark:data-checked:bg-sky-400 dark:data-checked:text-white",
  key_event:
    "border-red-500/70 data-checked:border-red-500 data-checked:bg-red-500 data-checked:text-white dark:data-checked:bg-red-500 dark:data-checked:text-white",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "완료",
  scheduled: "예정",
  in_progress: "진행중",
  pending: "펜딩",
  cancelled: "취소",
};

export const STATUS_OPTIONS: ProjectStatus[] = [
  "completed",
  "scheduled",
  "in_progress",
  "pending",
  "cancelled",
];

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
