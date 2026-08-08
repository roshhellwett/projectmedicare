-- ============================================================================
-- Janta Medicare LLP — Sunday camp posts + live bulletin board
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: every statement is guarded.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. camp_posts — the weekly Sunday free camp post (one active at a time)
-- ---------------------------------------------------------------------------
create table if not exists public.camp_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  description text        not null,
  venue       text        not null,
  address     text        not null,
  camp_date   date        not null,
  fee         text        not null default 'Registration ₹100 only',
  image_url   text,
  image_path  text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- Only one row may be active at any time.
create unique index if not exists camp_posts_single_active
  on public.camp_posts (is_active)
  where is_active;

create index if not exists camp_posts_created_at_idx
  on public.camp_posts (created_at desc);

grant select on public.camp_posts to anon, authenticated;
grant all    on public.camp_posts to service_role;

alter table public.camp_posts enable row level security;

drop policy if exists "camp_posts public read active" on public.camp_posts;
create policy "camp_posts public read active"
  on public.camp_posts for select
  to anon, authenticated
  using (is_active);

-- ---------------------------------------------------------------------------
-- 2. bulletins — notices and time-limited offers
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'bulletin_kind') then
    create type public.bulletin_kind as enum ('info', 'offer');
  end if;
end $$;

create table if not exists public.bulletins (
  id         uuid primary key default gen_random_uuid(),
  body       text        not null check (char_length(btrim(body)) between 1 and 600),
  kind       public.bulletin_kind not null default 'info',
  starts_at  timestamptz,
  ends_at    timestamptz,
  pinned     boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bulletins_window_valid    check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint bulletins_offer_needs_end check (kind <> 'offer' or ends_at is not null)
);

create index if not exists bulletins_feed_idx
  on public.bulletins (pinned desc, created_at desc);
create index if not exists bulletins_ends_at_idx
  on public.bulletins (ends_at) where ends_at is not null;

grant select on public.bulletins to anon, authenticated;
grant all    on public.bulletins to service_role;

alter table public.bulletins enable row level security;

-- The public only ever sees bulletins inside their visibility window, so an
-- expired offer disappears the moment it ends — even before the worker runs.
drop policy if exists "bulletins public read visible" on public.bulletins;
create policy "bulletins public read visible"
  on public.bulletins for select
  to anon, authenticated
  using (
    (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists bulletins_touch_updated_at on public.bulletins;
create trigger bulletins_touch_updated_at
  before update on public.bulletins
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Cleanup routine used by the Railway worker (service role only)
-- ---------------------------------------------------------------------------
create or replace function public.purge_expired_bulletins(grace_hours integer default 24)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.bulletins
   where kind = 'offer'
     and ends_at is not null
     and ends_at < now() - make_interval(hours => greatest(grace_hours, 0));
  get diagnostics removed = row_count;
  return removed;
end $$;

revoke all on function public.purge_expired_bulletins(integer) from public, anon, authenticated;
grant execute on function public.purge_expired_bulletins(integer) to service_role;

-- ---------------------------------------------------------------------------
-- 4. Storage: create a PUBLIC bucket named `camp-images` in the dashboard,
--    then this policy allows public reads. Writes stay service-role only
--    (uploads happen through the authenticated admin API).
-- ---------------------------------------------------------------------------
drop policy if exists "camp images public read" on storage.objects;
create policy "camp images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'camp-images');
create table if not exists public.medicines (
  id bigint primary key generated by default as identity,
  s_no integer not null,
  medicine_name text not null,
  selling_price numeric not null,
  pack_size text not null,
  mrp numeric not null
);

create table if not exists public.patient_rates (
  id bigint primary key generated by default as identity,
  sl_no integer not null,
  test_name text not null,
  jm_rate text not null,
  vail_name text
);

-- Enable RLS and grant public read access
alter table public.medicines enable row level security;
alter table public.patient_rates enable row level security;

create policy "medicines public read" on public.medicines for select to anon, authenticated using (true);
create policy "patient_rates public read" on public.patient_rates for select to anon, authenticated using (true);

-- Allow service_role full access
grant all on public.medicines to service_role;
grant all on public.patient_rates to service_role;
-- Create gender enum
CREATE TYPE doctor_gender AS ENUM ('male', 'female');

-- Create doctors table
CREATE TABLE public.doctors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  gender doctor_gender NOT NULL,
  specialty text NOT NULL,
  department text NOT NULL,
  qualifications text[] NOT NULL,
  contact text,
  image_url text,
  is_daily_chamber boolean DEFAULT false,
  daily_fee numeric DEFAULT 300,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on doctors" 
  ON public.doctors FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated full access on doctors" 
  ON public.doctors FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create storage bucket for doctor images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('doctor_images', 'doctor_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for doctor_images bucket
CREATE POLICY "Public Access for doctor_images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'doctor_images');

CREATE POLICY "Authenticated Insert for doctor_images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'doctor_images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update for doctor_images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'doctor_images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete for doctor_images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'doctor_images' AND auth.role() = 'authenticated');
