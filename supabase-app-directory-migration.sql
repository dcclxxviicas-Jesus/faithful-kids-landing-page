-- Christian Apps directory submissions (/christian-apps/submit).
-- Run once in Supabase -> SQL Editor. Service-role only: RLS on, no policies.

create table if not exists public.app_directory_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null default 'app' check (kind in ('app', 'website')),
  name text not null,
  maker text,
  category text not null,
  ages text,
  age_groups text[] not null default '{}',
  price_model text not null,
  price text,
  ios_url text,
  android_url text,
  web_url text,
  description text not null,
  contact_name text not null,
  contact_email text not null,
  contact_role text not null,
  notes_from_submitter text,
  status text not null default 'received' check (status in ('received', 'approved', 'rejected', 'spam')),
  slug text unique,
  admin_notes text,
  links_to_us boolean,
  links_checked_at timestamptz,
  approved_at timestamptz,
  source text,
  referrer text,
  ip_hash text,
  user_agent text
);

create index if not exists app_directory_submissions_status_idx on public.app_directory_submissions (status, created_at desc);
create index if not exists app_directory_submissions_email_idx on public.app_directory_submissions (contact_email, created_at desc);

alter table public.app_directory_submissions enable row level security;

create or replace function public.app_directory_touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists app_directory_touch on public.app_directory_submissions;
create trigger app_directory_touch before update on public.app_directory_submissions
  for each row execute function public.app_directory_touch();
