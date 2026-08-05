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
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
}
