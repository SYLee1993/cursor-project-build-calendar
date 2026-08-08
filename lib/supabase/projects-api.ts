import { STORAGE_KEY, STATUS_OPTIONS, TYPE_OPTIONS } from "@/lib/constants";
import {
  projectToInsert,
  rowToProject,
} from "@/lib/supabase/project-mapper";
import type { Project, ProjectStatus, ProjectType } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const MIGRATION_FLAG_KEY = "build-calendar:supabase-migrated";

function isProjectType(value: unknown): value is ProjectType {
  return (
    typeof value === "string" &&
    TYPE_OPTIONS.includes(value as ProjectType)
  );
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return (
    typeof value === "string" &&
    STATUS_OPTIONS.includes(value as ProjectStatus)
  );
}

function normalizeLegacyProject(input: unknown): Project | null {
  if (!input || typeof input !== "object") return null;

  const project = input as Partial<Project>;
  if (
    typeof project.name !== "string" ||
    !project.name.trim() ||
    typeof project.startDate !== "string" ||
    typeof project.endDate !== "string" ||
    !isProjectStatus(project.status)
  ) {
    return null;
  }

  return {
    id:
      typeof project.id === "string" && project.id.trim()
        ? project.id
        : crypto.randomUUID(),
    name: project.name.trim(),
    description:
      typeof project.description === "string" ? project.description : "",
    type: isProjectType(project.type) ? project.type : "cursor_project",
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    createdAt:
      typeof project.createdAt === "string"
        ? project.createdAt
        : new Date().toISOString(),
  };
}

function parseProjectsJson(raw: string): Project[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const parsed = JSON.parse(trimmed) as unknown;
  const items = Array.isArray(parsed) ? parsed : [parsed];

  return items
    .map((item) => normalizeLegacyProject(item))
    .filter((item): item is Project => item !== null);
}

function loadLegacyProjects(): Project[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return parseProjectsJson(raw);
  } catch {
    return [];
  }
}

interface LocalImportResult {
  imported: number;
  skipped: number;
}

async function importProjectsToSupabase(
  supabase: SupabaseClient<Database>,
  userId: string,
  legacyProjects: Project[],
): Promise<LocalImportResult> {
  if (legacyProjects.length === 0) {
    return { imported: 0, skipped: 0 };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("calendar_projects")
    .select("id");

  if (fetchError) throw fetchError;

  const existingIds = new Set((existing ?? []).map((row) => row.id));
  const toInsert = legacyProjects.filter((project) => !existingIds.has(project.id));
  const skipped = legacyProjects.length - toInsert.length;

  if (toInsert.length > 0) {
    const rows = toInsert.map((project) => ({
      ...projectToInsert(userId, {
        name: project.name,
        description: project.description,
        type: project.type,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      }),
      id: project.id,
      created_at: project.createdAt,
    }));

    const { error } = await supabase.from("calendar_projects").insert(rows);
    if (error) throw error;
  }

  return { imported: toInsert.length, skipped };
}

async function importLocalProjectsToSupabase(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<LocalImportResult> {
  if (typeof window === "undefined") {
    return { imported: 0, skipped: 0 };
  }

  const legacyProjects = loadLegacyProjects();
  const result = await importProjectsToSupabase(
    supabase,
    userId,
    legacyProjects,
  );

  if (legacyProjects.length > 0 && result.skipped + result.imported === legacyProjects.length) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(MIGRATION_FLAG_KEY, userId);
  }

  return result;
}

export async function migrateLocalStorageToSupabase(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { imported } = await importLocalProjectsToSupabase(supabase, userId);
  return imported;
}

export async function fetchProjects(
  supabase: SupabaseClient<Database>,
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("calendar_projects")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToProject);
}
