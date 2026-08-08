"use client";

import type { ReactNode } from "react";

import { ProjectListSidebar } from "@/components/projects/project-list-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Project } from "@/types/project";

interface CalendarViewLayoutProps {
  calendar: ReactNode;
  sidebarTitle: string;
  sidebarSubtitle: string;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  mobileSheetLabel?: string;
}

export function CalendarViewLayout({
  calendar,
  sidebarTitle,
  sidebarSubtitle,
  projects,
  onSelectProject,
  mobileSheetLabel,
}: CalendarViewLayoutProps) {
  return (
    <>
      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {calendar}

        <ProjectListSidebar
          className="hidden min-h-[480px] lg:flex"
          title={sidebarTitle}
          subtitle={sidebarSubtitle}
          projects={projects}
          onSelectProject={onSelectProject}
        />
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" className="w-full" />}>
            {mobileSheetLabel ?? `${sidebarTitle} ${projects.length}건 보기`}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>{sidebarTitle}</SheetTitle>
            </SheetHeader>
            <ProjectListSidebar
              className="mt-4 border-0"
              title={sidebarTitle}
              subtitle={sidebarSubtitle}
              projects={projects}
              onSelectProject={onSelectProject}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
