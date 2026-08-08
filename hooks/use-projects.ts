"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import {
  projectOverlapsMonth,
  projectOverlapsQuarter,
  projectOverlapsYear,
} from "@/lib/date-utils";
import {
  fetchProjects,
  migrateLocalStorageToSupabase,
} from "@/lib/supabase/projects-api";
import {
  projectToInsert,
  projectToUpdate,
  rowToProject,
} from "@/lib/supabase/project-mapper";
import type { Database } from "@/types/database";
import type { Project } from "@/types/project";

interface UseProjectsOptions {
  supabase: SupabaseClient<Database>;
  user: User | null;
}

export function useProjects({ supabase, user }: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoaded(true);
      return;
    }

    setError(null);
    try {
      await migrateLocalStorageToSupabase(supabase, user.id);
      const nextProjects = await fetchProjects(supabase);
      setProjects(nextProjects);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "일정을 불러오지 못했습니다.";
      setError(message);
      setProjects([]);
    } finally {
      setIsLoaded(true);
    }
  }, [supabase, user]);

  useEffect(() => {
    setIsLoaded(false);
    void reloadProjects();
  }, [reloadProjects]);

  const addProject = useCallback(
    async (data: Omit<Project, "id" | "createdAt">) => {
      if (!user) return null;

      const { data: row, error: insertError } = await supabase
        .from("calendar_projects")
        .insert(projectToInsert(user.id, data))
        .select("*")
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      const project = rowToProject(row);
      setProjects((prev) =>
        [...prev, project].sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ),
      );
      return project;
    },
    [supabase, user],
  );

  const updateProject = useCallback(
    async (id: string, data: Omit<Project, "id" | "createdAt">) => {
      const { data: row, error: updateError } = await supabase
        .from("calendar_projects")
        .update(projectToUpdate(data))
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) {
        setError(updateError.message);
        return;
      }

      const updated = rowToProject(row);
      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updated : project)),
      );
    },
    [supabase],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from("calendar_projects")
        .delete()
        .eq("id", id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setProjects((prev) => prev.filter((project) => project.id !== id));
    },
    [supabase],
  );

  const getProjectsByMonth = useCallback(
    (year: number, month: number) => {
      return projects
        .filter((project) => projectOverlapsMonth(project, year, month))
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
    },
    [projects],
  );

  const getProjectsByQuarter = useCallback(
    (year: number, quarter: number) => {
      return projects
        .filter((project) => projectOverlapsQuarter(project, year, quarter))
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
    },
    [projects],
  );

  const getProjectsByYear = useCallback(
    (year: number) => {
      return projects
        .filter((project) => projectOverlapsYear(project, year))
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
    },
    [projects],
  );

  return {
    projects,
    isLoaded,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByMonth,
    getProjectsByQuarter,
    getProjectsByYear,
    reloadProjects,
  };
}
