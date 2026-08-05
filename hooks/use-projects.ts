"use client";

import { useCallback, useEffect, useState } from "react";

import { STORAGE_KEY } from "@/lib/constants";
import { projectOverlapsMonth, projectOverlapsYear } from "@/lib/date-utils";
import type { Project } from "@/types/project";

function loadFromStorage(): Project[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed)
      ? parsed.map((project) => ({
          ...project,
          description: project.description ?? "",
        }))
      : [];
  } catch {
    return [];
  }
}

function saveToStorage(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjects(loadFromStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveToStorage(projects);
  }, [projects, isLoaded]);

  const addProject = useCallback(
    (data: Omit<Project, "id" | "createdAt">) => {
      const project: Project = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, project]);
      return project;
    },
    [],
  );

  const updateProject = useCallback(
    (id: string, data: Omit<Project, "id" | "createdAt">) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...data } : project,
        ),
      );
    },
    [],
  );

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, []);

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
    addProject,
    updateProject,
    deleteProject,
    getProjectsByMonth,
    getProjectsByYear,
  };
}
