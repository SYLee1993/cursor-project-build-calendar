"use client";

import { StatusBadge } from "@/components/projects/status-badge";
import { TypeBadge } from "@/components/projects/type-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TYPE_BAR_COLORS } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectListSidebarProps {
  projects: Project[];
  title: string;
  subtitle: string;
  onSelectProject: (project: Project) => void;
  className?: string;
}

export function ProjectListSidebar({
  projects,
  title,
  subtitle,
  onSelectProject,
  className,
}: ProjectListSidebarProps) {
  return (
    <aside className={cn("flex h-full flex-col rounded-lg border bg-card", className)}>
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <ScrollArea className="flex-1">
        {projects.length === 0 ? (
          <div className="flex h-40 items-center justify-center px-4 text-sm text-muted-foreground">
            등록된 프로젝트가 없습니다.
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {projects.map((project, index) => (
              <div key={project.id}>
                <button
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-muted/60"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="line-clamp-2 font-medium">{project.name}</span>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <TypeBadge type={project.type} className="text-[10px]" />
                      <StatusBadge status={project.status} className="text-[10px]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        TYPE_BAR_COLORS[project.type],
                      )}
                    />
                    {formatDisplayDate(project.startDate)} ~{" "}
                    {formatDisplayDate(project.endDate)}
                  </div>
                </button>
                {index < projects.length - 1 && <Separator className="mx-3" />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
