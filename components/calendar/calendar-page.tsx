"use client";

import { useCallback, useMemo, useState } from "react";

import { AuthPanel } from "@/components/auth/auth-panel";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarViewLayout } from "@/components/calendar/calendar-view-layout";
import {
  MonthCalendar,
  QuarterCalendarGrid,
  YearCalendarGrid,
} from "@/components/calendar/month-calendar";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { TYPE_OPTIONS } from "@/lib/constants";
import { filterProjectsByTypes } from "@/lib/project-utils";
import {
  formatQuarterLabel,
  getAdjacentMonths,
  getQuarterFromMonth,
  type CalendarViewMode,
} from "@/types/calendar";
import type { Project, ProjectType } from "@/types/project";

export function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedTypes, setSelectedTypes] = useState<ProjectType[]>([
    ...TYPE_OPTIONS,
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultStartDate, setDefaultStartDate] = useState<string | undefined>();

  const {
    supabase,
    user,
    isLoading: isAuthLoading,
    authError,
    signInWithOtp,
    signOut,
  } = useAuth();

  const {
    projects,
    isLoaded,
    error: projectsError,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByMonth,
    getProjectsByQuarter,
    getProjectsByYear,
  } = useProjects({ supabase, user });

  const filteredProjects = useMemo(
    () => filterProjectsByTypes(projects, selectedTypes),
    [projects, selectedTypes],
  );

  const monthProjects = useMemo(
    () => filterProjectsByTypes(getProjectsByMonth(year, month), selectedTypes),
    [getProjectsByMonth, year, month, selectedTypes],
  );

  const quarter = getQuarterFromMonth(month);
  const quarterMonths = useMemo(
    () => getAdjacentMonths(year, month),
    [year, month],
  );

  const quarterProjects = useMemo(
    () =>
      filterProjectsByTypes(getProjectsByQuarter(year, quarter), selectedTypes),
    [getProjectsByQuarter, year, quarter, selectedTypes],
  );

  const yearProjects = useMemo(
    () => filterProjectsByTypes(getProjectsByYear(year), selectedTypes),
    [getProjectsByYear, year, selectedTypes],
  );

  const handleToggleType = useCallback((type: ProjectType, checked: boolean) => {
    setSelectedTypes((prev) => {
      if (checked) {
        return prev.includes(type) ? prev : [...prev, type];
      }
      return prev.filter((item) => item !== type);
    });
  }, []);

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

  const handleProjectDatesChange = useCallback(
    (projectId: string, dates: Pick<Project, "startDate" | "endDate">) => {
      const project = projects.find((item) => item.id === projectId);
      if (!project) return;

      updateProject(projectId, {
        name: project.name,
        description: project.description,
        type: project.type,
        status: project.status,
        ...dates,
      });
    },
    [projects, updateProject],
  );

  const handleProjectCopy = useCallback(
    (project: Project, dates: Pick<Project, "startDate" | "endDate">) => {
      addProject({
        name: project.name,
        description: project.description,
        type: project.type,
        status: project.status,
        ...dates,
      });
    },
    [addProject],
  );

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

  const calendarShared = {
    projects: filteredProjects,
    onDayClick: openCreateDialog,
    onProjectClick: openEditDialog,
    onProjectDatesChange: handleProjectDatesChange,
    onProjectCopy: handleProjectCopy,
  };

  if (isAuthLoading || (user && !isLoaded)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Personal Calendar</h1>
        </header>
        <AuthPanel onSignIn={signInWithOtp} error={authError} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personal Calendar</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void signOut()}>
          로그아웃
        </Button>
      </header>

      {projectsError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {projectsError}
        </p>
      ) : null}

      <CalendarHeader
        year={year}
        month={month}
        viewMode={viewMode}
        selectedTypes={selectedTypes}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onViewModeChange={setViewMode}
        onToggleType={handleToggleType}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {viewMode === "month" && (
        <CalendarViewLayout
          sidebarTitle="Month Event"
          sidebarSubtitle={`${year}년 ${month + 1}월 · ${monthProjects.length}건`}
          projects={monthProjects}
          onSelectProject={openEditDialog}
          mobileSheetLabel={`Month Event ${monthProjects.length}건 보기`}
          calendar={
            <MonthCalendar
              year={year}
              month={month}
              {...calendarShared}
            />
          }
        />
      )}

      {viewMode === "quarter" && (
        <CalendarViewLayout
          sidebarTitle="Quarter Event"
          sidebarSubtitle={`${formatQuarterLabel(year, month)} · ${quarterProjects.length}건`}
          projects={quarterProjects}
          onSelectProject={openEditDialog}
          mobileSheetLabel={`Quarter Event ${quarterProjects.length}건 보기`}
          calendar={
            <QuarterCalendarGrid months={quarterMonths} shared={calendarShared} />
          }
        />
      )}

      {viewMode === "year" && (
        <CalendarViewLayout
          sidebarTitle="Year Event"
          sidebarSubtitle={`${year}년 · ${yearProjects.length}건`}
          projects={yearProjects}
          onSelectProject={openEditDialog}
          mobileSheetLabel={`Year Event ${yearProjects.length}건 보기`}
          calendar={<YearCalendarGrid year={year} shared={calendarShared} />}
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
