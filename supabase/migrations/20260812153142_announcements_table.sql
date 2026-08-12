create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

-- RLS
alter table public.announcements enable row level security;

grant select on public.announcements to anon, authenticated;
grant all on public.announcements to service_role;

-- Read access to everyone
create policy "Announcements are viewable by everyone."
  on public.announcements for select
  using (true);

-- Insert/Update/Delete access only to admin (service role will bypass RLS, but just to be explicit)
create policy "Admin can insert announcements."
  on public.announcements for insert
  with check (auth.role() = 'authenticated');

create policy "Admin can update announcements."
  on public.announcements for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete announcements."
  on public.announcements for delete
  using (auth.role() = 'authenticated');
