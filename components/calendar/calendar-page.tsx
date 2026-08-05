"use client";

import { useMemo, useState } from "react";

import { CalendarHeader } from "@/components/calendar/calendar-header";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ProjectListSidebar } from "@/components/projects/project-list-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProjects } from "@/hooks/use-projects";
import type { CalendarViewMode } from "@/types/calendar";
import type { Project } from "@/types/project";

export function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultStartDate, setDefaultStartDate] = useState<string | undefined>();

  const {
    projects,
    isLoaded,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByMonth,
    getProjectsByYear,
  } = useProjects();

  const monthProjects = useMemo(
    () => getProjectsByMonth(year, month),
    [getProjectsByMonth, year, month],
  );

  const yearProjects = useMemo(
    () => getProjectsByYear(year),
    [getProjectsByYear, year],
  );

  const openCreateDialog = (date?: string) => {
    setEditingProject(null);
    setDefaultStartDate(date);
    setDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setDefaultStartDate(undefined);
    setDialogOpen(true);
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear((value) => value - 1);
      setMonth(11);
      return;
    }
    setMonth((value) => value - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear((value) => value + 1);
      setMonth(0);
      return;
    }
    setMonth((value) => value + 1);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Cursor Project Build Calendar</h1>
      </header>

      <CalendarHeader
        year={year}
        month={month}
        viewMode={viewMode}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onViewModeChange={setViewMode}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onAddProject={() => openCreateDialog()}
      />

      {viewMode === "day" && (
        <>
          <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <MonthCalendar
              year={year}
              month={month}
              projects={projects}
              onDayClick={(date) => openCreateDialog(date)}
              onProjectClick={openEditDialog}
            />

            <ProjectListSidebar
              className="hidden min-h-[480px] lg:flex"
              title="이달 프로젝트"
              subtitle={`${year}년 ${month + 1}월 · ${monthProjects.length}건`}
              projects={monthProjects}
              onSelectProject={openEditDialog}
            />
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="w-full" />}>
                이달 프로젝트 {monthProjects.length}건 보기
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader>
                  <SheetTitle>
                    {year}년 {month + 1}월 프로젝트
                  </SheetTitle>
                </SheetHeader>
                <ProjectListSidebar
                  className="mt-4 border-0"
                  title="이달 프로젝트"
                  subtitle={`${year}년 ${month + 1}월 · ${monthProjects.length}건`}
                  projects={monthProjects}
                  onSelectProject={openEditDialog}
                />
              </SheetContent>
            </Sheet>
          </div>
        </>
      )}

      {viewMode === "month" && (
        <ProjectListSidebar
          className="min-h-[480px]"
          title="이달 프로젝트"
          subtitle={`${year}년 ${month + 1}월 · ${monthProjects.length}건`}
          projects={monthProjects}
          onSelectProject={openEditDialog}
        />
      )}

      {viewMode === "year" && (
        <ProjectListSidebar
          className="min-h-[480px]"
          title="올해 프로젝트"
          subtitle={`${year}년 · ${yearProjects.length}건`}
          projects={yearProjects}
          onSelectProject={openEditDialog}
        />
      )}

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        defaultStartDate={defaultStartDate}
        onSave={(data) => {
          if (editingProject) {
            updateProject(editingProject.id, data);
            return;
          }
          addProject(data);
        }}
        onDelete={deleteProject}
      />
    </div>
  );
}
