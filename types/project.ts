export type ProjectType = "work" | "cursor_project" | "workout" | "personal" | "key_event";

export type ProjectStatus =
  | "completed"
  | "scheduled"
  | "in_progress"
  | "pending"
  | "cancelled";

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
}
