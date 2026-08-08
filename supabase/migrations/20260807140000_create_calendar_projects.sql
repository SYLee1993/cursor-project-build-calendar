-- Calendar app: personal schedule projects

create type public.calendar_project_type as enum (
  'work',
  'cursor_project',
  'workout',
  'personal',
  'key_event'
);

create type public.calendar_project_status as enum (
  'completed',
  'scheduled',
  'in_progress',
  'pending',
  'cancelled'
);

create table public.calendar_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  type public.calendar_project_type not null default 'cursor_project',
  start_date date not null,
  end_date date not null,
  status public.calendar_project_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_projects_date_range check (start_date <= end_date)
);

create index calendar_projects_user_id_idx on public.calendar_projects (user_id);
create index calendar_projects_user_dates_idx on public.calendar_projects (user_id, start_date, end_date);

alter table public.calendar_projects enable row level security;

create policy "calendar_projects_select_own"
  on public.calendar_projects for select
  to authenticated
  using (auth.uid() = user_id);

create policy "calendar_projects_insert_own"
  on public.calendar_projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "calendar_projects_update_own"
  on public.calendar_projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "calendar_projects_delete_own"
  on public.calendar_projects for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_calendar_projects_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger calendar_projects_updated_at
  before update on public.calendar_projects
  for each row
  execute function public.set_calendar_projects_updated_at();
