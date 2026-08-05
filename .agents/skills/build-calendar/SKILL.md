---
name: build-calendar
description: Build Calendar project conventions — localStorage key, ProjectStatus enum, status colors, calendar grid layout. Use when adding features to this project calendar app.
---

# Build Calendar Project Skill

## Data Model

```typescript
type ProjectStatus = "completed" | "scheduled" | "in_progress" | "pending" | "cancelled"

interface Project {
  id: string
  name: string
  startDate: string   // ISO "YYYY-MM-DD"
  endDate: string
  status: ProjectStatus
  createdAt: string
}
```

## Storage

- localStorage key: `build-calendar:projects`
- All persistence is client-side via `hooks/use-projects.ts`

## Status Labels & Colors

| Status | Label | Tailwind bar color |
|--------|-------|-------------------|
| completed | 개발완료 | bg-violet-500 |
| scheduled | 개발예정 | bg-blue-500 |
| in_progress | 개발중 | bg-green-500 |
| pending | 개발펜딩 | bg-amber-500 |
| cancelled | 개발취소 | bg-muted-foreground/50 |

## UI Layout

- Left: month grid (Sun–Sat), 1st to last day of month
- Right: project list filtered by selected year/month
- Click day cell → open ProjectFormDialog with default start date

## Stack

Next.js App Router + shadcn/ui + date-fns + localStorage
