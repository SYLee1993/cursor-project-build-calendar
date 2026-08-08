import type { Project, ProjectType } from "@/types/project";

export function filterProjectsByTypes(
  projects: Project[],
  selectedTypes: ProjectType[],
): Project[] {
  if (selectedTypes.length === 0) return [];
  const selected = new Set(selectedTypes);
  return projects.filter((project) => selected.has(project.type));
}
