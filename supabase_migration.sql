-- ========================================================
-- URBAN GAZ LIMITED — SUPABASE DATABASE MIGRATION SCRIPT
-- Copy and paste this into the Supabase SQL Editor and click RUN
-- ========================================================

-- 1. Create Profiles table (User Roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text default '',
  role text not null default 'inspector', -- 'inspector' or 'admin'
  created_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
drop policy if exists "Public profiles are readable by authenticated users" on public.profiles;
create policy "Public profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. Function to check if current user is Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 3. Automatic Profile Trigger on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when lower(new.email) = 'lian@urbangaz.com' then 'admin' else 'inspector' end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = case when lower(excluded.email) = 'lian@urbangaz.com' then 'admin' else public.profiles.role end;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create Projects table
create table if not exists public.projects (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  area_name text not null default 'RUAP',
  building_name text not null default 'SHAPLA BUILDING 13B',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);

-- Enable RLS on Projects
alter table public.projects enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can select their own projects" on public.projects;
drop policy if exists "Users can insert their own projects" on public.projects;
drop policy if exists "Users can update their own projects" on public.projects;
drop policy if exists "Users can delete their own projects" on public.projects;
drop policy if exists "Inspectors view own projects / Admin views all" on public.projects;
drop policy if exists "Inspectors insert own projects" on public.projects;
drop policy if exists "Inspectors update own projects / Admin updates all" on public.projects;
drop policy if exists "Inspectors delete own projects / Admin deletes all" on public.projects;

-- RLS Policies: Inspectors see ONLY their own files. Admins see ALL files.
create policy "Inspectors view own projects / Admin views all"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Inspectors insert own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Inspectors update own projects / Admin updates all"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Inspectors delete own projects / Admin deletes all"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- Ensure lian@urbangaz.com is set to admin role
UPDATE public.profiles SET role = 'admin' WHERE lower(email) = 'lian@urbangaz.com';
