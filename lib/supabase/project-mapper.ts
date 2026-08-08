import type {
  CalendarProjectInsert,
  CalendarProjectRow,
  CalendarProjectUpdate,
} from "@/types/database";
import type { Project } from "@/types/project";

export function rowToProject(row: CalendarProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function projectToInsert(
  userId: string,
  data: Omit<Project, "id" | "createdAt">,
): CalendarProjectInsert {
  return {
    user_id: userId,
    name: data.name,
    description: data.description,
    type: data.type,
    start_date: data.startDate,
    end_date: data.endDate,
    status: data.status,
  };
}

export function projectToUpdate(
  data: Omit<Project, "id" | "createdAt">,
): CalendarProjectUpdate {
  return {
    name: data.name,
    description: data.description,
    type: data.type,
    start_date: data.startDate,
    end_date: data.endDate,
    status: data.status,
  };
}
